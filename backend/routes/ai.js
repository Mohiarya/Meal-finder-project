import express from "express";
import prisma from "../config/prisma.js";
import { authenticateToken } from "../middleware/auth.js";
import { aiLimiter } from "../middleware/rateLimiters.js";
import {
  extractConstraints,
  constraintsFromProfile,
  filterWithFallback,
  rankByPromptRelevance,
  rankByRemainingBudget,
  formatMeal,
} from "../services/recommendationEngine.js";

const router = express.Router();

// Helper to query OpenAI if key exists
async function callOpenAI({ systemPrompt, userMessage }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !apiKey.startsWith("sk-")) {
    return null;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.5,
        max_tokens: 450,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      console.warn("OpenAI API returned error status:", response.status);
      return null;
    }

    const data = await response.json();
    return JSON.parse(data.choices?.[0]?.message?.content || "{}");
  } catch (error) {
    console.error("OpenAI API call failed or parsing error:", error);
    return null;
  }
}

// OpenAI is only ever allowed to *phrase* an explanation of a meal the
// deterministic engine already selected — never to pick the meal or
// invent a nutrition number. This validates the shape/type of what came
// back before it's ever shown to a user; anything malformed is treated
// exactly like "OpenAI unavailable" (silently ignored, deterministic
// text is kept) rather than rendered as-is.
function isValidAiEnrichment(json) {
  if (!json || typeof json !== "object") return false;
  const { headline, reason, nutritionTip } = json;
  if (typeof headline !== "string" || !headline.trim() || headline.length > 80) return false;
  if (typeof reason !== "string" || !reason.trim() || reason.length > 400) return false;
  if (nutritionTip !== undefined && (typeof nutritionTip !== "string" || nutritionTip.length > 300)) return false;
  return true;
}

async function loadAiContext(userId) {
  const todayIso = new Date().toISOString().split("T")[0];
  const [profile, logs, allMeals] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.mealLog.findMany({ where: { userId, date: todayIso } }),
    prisma.meal.findMany({ include: { ingredients: { include: { ingredient: true } } } }),
  ]);

  const consumedCalories = logs.reduce((sum, l) => sum + l.calories, 0);
  const consumedProtein = logs.reduce((sum, l) => sum + l.protein, 0);
  const targetCalories = profile?.dailyCalorieTarget || 2000;
  const targetProtein = profile?.proteinTarget || 120;

  const todayTracker = {
    nutrition: {
      calories: {
        consumed: consumedCalories,
        target: targetCalories,
        remaining: Math.max(0, targetCalories - consumedCalories),
      },
      protein: {
        consumed: consumedProtein,
        target: targetProtein,
        remaining: Math.max(0, targetProtein - consumedProtein),
      },
    },
  };

  return { profile, allMeals, todayTracker };
}

function buildExplanation(bestMatch, constraints, exactMatchFound, relaxedReason) {
  if (!bestMatch) {
    return {
      headline: "No Recipes Found",
      reason: "We could not find any recipes meeting your constraints in the database.",
      nutritionTip: "Try relaxing some filters or browsing the full catalog in Meal Finder.",
    };
  }

  const slotLabel = constraints.requestedSlot
    ? constraints.requestedSlot.charAt(0).toUpperCase() + constraints.requestedSlot.slice(1)
    : bestMatch.mealType.charAt(0).toUpperCase() + bestMatch.mealType.slice(1);

  if (!exactMatchFound) {
    return {
      headline: "Closest Available Match",
      reason: relaxedReason || `Closest match meeting your dietary criteria at ${bestMatch.calories} kcal and ${bestMatch.protein}g protein.`,
      nutritionTip: "All ingredients and nutrition values are sourced directly from our curated recipe database.",
    };
  }

  if (constraints.caloriePreference === "low" && constraints.proteinPreference === "high") {
    return {
      headline: `Top Low-Calorie, High-Protein ${slotLabel}`,
      reason: `Delivers ${bestMatch.protein}g protein at only ${bestMatch.calories} kcal, achieving an outstanding protein-to-calorie ratio without excess carbs or fat.`,
      nutritionTip: "Rich in lean amino acids while strictly respecting your calorie ceiling.",
    };
  }
  if (constraints.diet === "vegetarian") {
    return {
      headline: `Ideal Vegetarian ${slotLabel}`,
      reason: `100% vegetarian, providing ${bestMatch.protein}g wholesome plant protein at ${bestMatch.calories} kcal.`,
      nutritionTip: `Packed with nutrient-dense ${bestMatch.cuisine} ingredients and zero meat.`,
    };
  }
  if (constraints.diet === "vegan") {
    return {
      headline: `Ideal 100% Plant-Based ${slotLabel}`,
      reason: `Delivers ${bestMatch.protein}g plant protein at ${bestMatch.calories} kcal with zero animal products.`,
      nutritionTip: "Clean, wholesome, and completely vegan-certified.",
    };
  }
  return {
    headline: `Best Grounded Match for ${slotLabel}`,
    reason: `Selected from our database: provides ${bestMatch.protein}g protein at ${bestMatch.calories} kcal, fitting your current request.`,
    nutritionTip: `Takes only ${bestMatch.prepTimeMinutes + bestMatch.cookTimeMinutes} minutes to prepare.`,
  };
}

// POST /api/ai/assistant
router.post("/assistant", authenticateToken, aiLimiter, async (req, res) => {
  try {
    const { prompt } = req.body;
    const userId = req.user.id;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const { profile, allMeals, todayTracker } = await loadAiContext(userId);

    // Constraints are derived fresh from THIS prompt + persistent profile
    // only — no prior request's state is ever read here, so a follow-up
    // prompt can never inherit a previous one's constraints.
    const constraints = extractConstraints(prompt, profile, todayTracker);
    const { candidates, exactMatchFound, relaxedReason } = filterWithFallback(allMeals, constraints);
    const ranked = rankByPromptRelevance(candidates, constraints);

    const bestMealRaw = ranked[0] || null;
    const alternativesRaw = ranked.slice(1, 4);
    const bestMatch = bestMealRaw ? formatMeal(bestMealRaw, constraints) : null;
    const recommendations = alternativesRaw.map((m) => formatMeal(m, constraints));

    let { headline, reason, nutritionTip } = buildExplanation(bestMatch, constraints, exactMatchFound, relaxedReason);

    if (bestMatch) {
      const systemPrompt = `You are a certified nutrition expert AI Copilot for MealFinder.
User Query: "${prompt}"
Verified Database Meal Selected: Title="${bestMatch.title}", Calories=${bestMatch.calories}, Protein=${bestMatch.protein}g, Carbs=${bestMatch.carbs}g, Fat=${bestMatch.fat}g, Cuisine="${bestMatch.cuisine}", MealType="${bestMatch.mealType}".
CRITICAL RULE: DO NOT INVENT ANY CALORIES OR MACROS. Only use the exact numbers given.
Return JSON:
{
  "headline": "Punchy 3-5 word headline",
  "reason": "1-2 concise sentences explaining why this fits their exact query (${prompt})",
  "nutritionTip": "1 practical culinary or macro tip"
}`;

      const aiJson = await callOpenAI({
        systemPrompt,
        userMessage: `Explain why ${bestMatch.title} is the best match for "${prompt}".`,
      });

      if (isValidAiEnrichment(aiJson)) {
        headline = aiJson.headline;
        reason = aiJson.reason;
        if (aiJson.nutritionTip) nutritionTip = aiJson.nutritionTip;
      }
      // else: malformed or absent AI response — the deterministic
      // headline/reason/nutritionTip computed above are used as-is.
    }

    res.json({
      intent: {
        maxCalories: constraints.maxCalories,
        minProtein: constraints.minProtein,
        requestedSlot: constraints.requestedSlot,
        diet: constraints.diet,
        requestedCuisine: constraints.requestedCuisine,
        caloriePreference: constraints.caloriePreference,
        proteinPreference: constraints.proteinPreference,
        excludedTerms: constraints.excludedTerms,
        exactMatchFound,
      },
      headline,
      reason,
      nutritionTip,
      bestMatch,
      recommendations,
      exactMatch: exactMatchFound,
    });
  } catch (error) {
    console.error("AI Assistant error:", error);
    res.status(500).json({ error: "Failed to generate AI recommendations" });
  }
});

// POST /api/ai/cook-with-ingredients
router.post("/cook-with-ingredients", authenticateToken, aiLimiter, async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: "List of ingredients is required" });
    }

    const normalizedInputs = ingredients.map((i) => i.toLowerCase().trim()).filter(Boolean);

    const meals = await prisma.meal.findMany({
      include: { ingredients: { include: { ingredient: true } } },
    });

    const scoredMeals = meals.map((meal) => {
      const matchingIngredients = [];
      const missingIngredients = [];

      meal.ingredients.forEach((mi) => {
        const name = mi.ingredient.name.toLowerCase();
        const hasMatch = normalizedInputs.some(
          (input) => name.includes(input) || input.includes(name) || (input.length > 3 && name.startsWith(input.slice(0, 4)))
        );

        if (hasMatch) {
          matchingIngredients.push(mi.ingredient.name);
        } else {
          missingIngredients.push({
            name: mi.ingredient.name,
            amount: mi.amount,
            unit: mi.unit,
            category: mi.ingredient.category || "Pantry",
          });
        }
      });

      const matchRatio = matchingIngredients.length / (meal.ingredients.length || 1);

      return {
        id: meal.id,
        title: meal.title,
        description: meal.description,
        imageUrl: meal.imageUrl,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        prepTimeMinutes: meal.prepTimeMinutes,
        cookTimeMinutes: meal.cookTimeMinutes,
        cuisine: meal.cuisine,
        mealType: meal.mealType,
        matchCount: matchingIngredients.length,
        matchPercentage: Math.round(matchRatio * 100),
        matchingIngredients,
        missingIngredients,
        dietaryTags: JSON.parse(meal.dietaryTags || "[]"),
        instructions: JSON.parse(meal.instructions || "[]"),
      };
    });

    scoredMeals.sort((a, b) => b.matchCount - a.matchCount || b.matchPercentage - a.matchPercentage);
    const topMatches = scoredMeals.filter((m) => m.matchCount > 0).slice(0, 8);

    res.json({
      userIngredients: ingredients,
      matches: topMatches,
      count: topMatches.length,
    });
  } catch (error) {
    console.error("Cook with ingredients error:", error);
    res.status(500).json({ error: "Failed to match meals with ingredients" });
  }
});

// GET /api/ai/quick-copilot-recommendation (Dashboard "what's next")
// Uses the SAME hard-constraint filter as /assistant (diet + allergens +
// meal-slot are never violated here either — this used to skip allergen
// filtering entirely, a real gap fixed by sharing recommendationEngine.js
// instead of re-implementing filtering). Ranking is deliberately
// different (closest-to-remaining-budget, not protein-density scoring)
// because there's no explicit request to rank against — see
// rankByRemainingBudget's own comment for why that's intentional.
router.get("/quick-copilot-recommendation", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const todayIso = new Date().toISOString().split("T")[0];

    const [profile, logs, allMeals] = await Promise.all([
      prisma.profile.findUnique({ where: { userId } }),
      prisma.mealLog.findMany({ where: { userId, date: todayIso } }),
      prisma.meal.findMany({ include: { ingredients: { include: { ingredient: true } } } }),
    ]);

    const consumedCalories = logs.reduce((sum, l) => sum + l.calories, 0);
    const consumedProtein = logs.reduce((sum, l) => sum + l.protein, 0);
    const targetCalories = profile?.dailyCalorieTarget || 2000;
    const targetProtein = profile?.proteinTarget || 120;
    const remainingCalories = Math.max(0, targetCalories - consumedCalories);
    const remainingProtein = Math.max(0, targetProtein - consumedProtein);

    const loggedSlots = new Set(logs.map((l) => l.slot.toLowerCase()));
    let nextSlot = "dinner";
    if (!loggedSlots.has("breakfast")) nextSlot = "breakfast";
    else if (!loggedSlots.has("lunch")) nextSlot = "lunch";
    else if (!loggedSlots.has("dinner")) nextSlot = "dinner";
    else nextSlot = "snack";

    const constraints = constraintsFromProfile(profile, { requestedSlot: nextSlot });
    let { candidates } = filterWithFallback(allMeals, constraints);
    if (candidates.length === 0) candidates = allMeals;

    const ranked = rankByRemainingBudget(candidates, remainingCalories);
    const chosen = ranked[0];

    res.json({
      remainingCalories,
      remainingProtein,
      nextSlot,
      recommendation: formatMeal(chosen, {}),
    });
  } catch (error) {
    console.error("Quick copilot error:", error);
    res.status(500).json({ error: "Failed to load copilot recommendation" });
  }
});

export default router;
