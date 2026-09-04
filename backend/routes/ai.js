import express from "express";
import prisma from "../config/prisma.js";
import { authenticateToken } from "../middleware/auth.js";

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

// Multi-constraint Semantic Parser
function extractConstraints(prompt, profile, todayTracker) {
  const lower = prompt.toLowerCase();

  // 1. Meal slot extraction (Hard constraint)
  let requestedSlot = null;
  if (lower.includes("breakfast") || lower.includes("morning")) {
    requestedSlot = "breakfast";
  } else if (lower.includes("dinner") || lower.includes("supper") || lower.includes("evening")) {
    requestedSlot = "dinner";
  } else if (lower.includes("lunch") || lower.includes("afternoon")) {
    requestedSlot = "lunch";
  } else if (lower.includes("snack") || lower.includes("dessert")) {
    requestedSlot = "snack";
  }

  // 2. Calorie constraint extraction (Hard constraint)
  let maxCalories = null;
  let caloriePreference = "balanced";

  const numCalMatch = lower.match(/(?:under|within|below|have|less than|about|around|<)?\s*(\d{3,4})\s*(?:cal|calories|kcal)/i);
  if (numCalMatch) {
    maxCalories = parseInt(numCalMatch[1], 10);
    caloriePreference = maxCalories <= 450 ? "low" : "budget";
  } else if (
    lower.includes("low-calorie") ||
    lower.includes("low calorie") ||
    lower.includes("light meal") ||
    lower.includes("low cal")
  ) {
    // Explicit low-calorie request: apply sensible ceilings by meal type
    caloriePreference = "low";
    if (requestedSlot === "breakfast") maxCalories = 350;
    else if (requestedSlot === "snack") maxCalories = 220;
    else maxCalories = 450;
  } else if (
    lower.includes("remaining calorie") ||
    lower.includes("calories left") ||
    lower.includes("use my remaining")
  ) {
    const rem = todayTracker?.nutrition?.calories?.remaining;
    maxCalories = rem && rem > 150 ? rem : profile?.dailyCalorieTarget ? Math.round(profile.dailyCalorieTarget / 3) : 500;
  }

  // 3. Protein constraint extraction (Hard constraint)
  let minProtein = null;
  let proteinPreference = "standard";

  const numProtMatch = lower.match(/(?:at least|need|over|min|minimum|>)?\s*(\d{2,3})\s*g\s*(?:of\s*)?protein/i);
  if (numProtMatch) {
    minProtein = parseInt(numProtMatch[1], 10);
    proteinPreference = "high";
  } else if (
    lower.includes("high-protein") ||
    lower.includes("high protein") ||
    lower.includes("hit my protein") ||
    lower.includes("protein target")
  ) {
    proteinPreference = "high";
    if (requestedSlot === "breakfast") minProtein = 20;
    else if (requestedSlot === "snack") minProtein = 12;
    else minProtein = 30; // 30g+ is standard high-protein threshold for a single lunch/dinner
  }

  // 4. Dietary preferences (Hard constraint)
  let diet = null;
  if (lower.includes("vegan") || profile?.dietPreference === "vegan") {
    diet = "vegan";
  } else if (lower.includes("vegetarian") || lower.includes("veggie") || profile?.dietPreference === "vegetarian") {
    diet = "vegetarian";
  } else if (lower.includes("pescatarian") || profile?.dietPreference === "pescatarian") {
    diet = "pescatarian";
  } else if (lower.includes("keto") || lower.includes("low carb") || profile?.dietPreference === "keto") {
    diet = "keto";
  }

  // 5. Explicit Cuisine constraint
  const cuisinesList = [
    "indian",
    "mediterranean",
    "italian",
    "mexican",
    "american",
    "japanese",
    "korean",
    "thai",
    "middle eastern",
    "asian",
  ];
  let requestedCuisine = null;
  for (const c of cuisinesList) {
    if (lower.includes(c)) {
      requestedCuisine = c;
      break;
    }
  }

  // 6. Time constraints
  let maxTimeMinutes = null;
  const timeMatch = lower.match(/(?:under|in|<|less than)?\s*(\d{1,2})\s*(?:min|mins|minutes)/i);
  if (timeMatch) {
    maxTimeMinutes = parseInt(timeMatch[1], 10);
  } else if (lower.includes("quick") || lower.includes("fast") || lower.includes("speedy")) {
    maxTimeMinutes = 20;
  }

  // 7. Allergens & Disliked items (Strict Exclusion)
  const promptAllergens = [];
  const allergyMatch = lower.match(/(?:allergic to|no|without|avoid)\s+([a-z\s,]+?)(?:\.|$|find|and|under|with)/i);
  if (allergyMatch) {
    const items = allergyMatch[1].split(/,|\band\b/).map((s) => s.trim()).filter(Boolean);
    promptAllergens.push(...items);
  }

  let profileAllergies = [];
  try {
    profileAllergies = JSON.parse(profile?.allergies || "[]");
  } catch {}

  let profileDisliked = [];
  try {
    profileDisliked = JSON.parse(profile?.dislikedFoods || "[]");
  } catch {}

  const excludedTerms = [
    ...new Set([...promptAllergens, ...profileAllergies, ...profileDisliked].map((s) => s.toLowerCase().trim())),
  ].filter((s) => s.length >= 3);

  return {
    requestedSlot,
    maxCalories,
    caloriePreference,
    minProtein,
    proteinPreference,
    diet,
    requestedCuisine,
    maxTimeMinutes,
    excludedTerms,
  };
}

// POST /api/ai/assistant
router.post("/assistant", authenticateToken, async (req, res) => {
  try {
    const { prompt } = req.body;
    const userId = req.user.id;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const todayIso = new Date().toISOString().split("T")[0];

    // Fetch user context & today's tracker
    const [profile, logs, allMeals] = await Promise.all([
      prisma.profile.findUnique({ where: { userId } }),
      prisma.mealLog.findMany({ where: { userId, date: todayIso } }),
      prisma.meal.findMany({
        include: { ingredients: { include: { ingredient: true } } },
      }),
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

    // 1. Extract natural-language constraints
    const constraints = extractConstraints(prompt, profile, todayTracker);

    // 2. HARD FILTERING: Never violate hard constraints
    const matchesHardConstraints = (meal, options = {}) => {
      const tags = JSON.parse(meal.dietaryTags || "[]");
      const ingredients = meal.ingredients.map((i) => i.ingredient.name.toLowerCase());
      const titleLower = meal.title.toLowerCase();

      // Rule A: Allergens & Disliked Foods (MUST EXCLUDE)
      for (const excluded of constraints.excludedTerms) {
        if (titleLower.includes(excluded)) return false;
        if (ingredients.some((ing) => ing.includes(excluded))) return false;
      }

      // Rule B: Meal Type Integrity (MUST RESPECT)
      if (constraints.requestedSlot) {
        const slot = constraints.requestedSlot;
        if (slot === "breakfast" && meal.mealType !== "breakfast") return false;
        if (slot === "snack" && meal.mealType !== "snack") return false;
        if (slot === "dinner") {
          // Never return breakfast or snack for dinner!
          if (meal.mealType === "breakfast" || meal.mealType === "snack") return false;
        }
        if (slot === "lunch") {
          // Never return breakfast or snack for lunch!
          if (meal.mealType === "breakfast" || meal.mealType === "snack") return false;
        }
      }

      // Rule C: Dietary Restriction (MUST RESPECT)
      if (constraints.diet === "vegan" && !tags.includes("Vegan")) return false;
      if (constraints.diet === "vegetarian" && !(tags.includes("Vegetarian") || tags.includes("Vegan"))) return false;
      if (constraints.diet === "pescatarian" && !(tags.includes("Pescatarian") || tags.includes("Vegetarian") || tags.includes("Vegan"))) return false;
      if (constraints.diet === "keto" && !(tags.includes("Keto") || tags.includes("Low-Carb"))) return false;

      // Rule D: Explicit Cuisine (If specified)
      if (constraints.requestedCuisine && !options.relaxCuisine) {
        if (!meal.cuisine.toLowerCase().includes(constraints.requestedCuisine.toLowerCase())) {
          return false;
        }
      }

      // Rule E: Calorie Ceiling (HARD CONSTRAINT)
      if (constraints.maxCalories && !options.relaxCalories) {
        if (meal.calories > constraints.maxCalories) return false;
      }

      // Rule F: Protein Floor (HARD CONSTRAINT)
      if (constraints.minProtein && !options.relaxProtein) {
        if (meal.protein < constraints.minProtein) return false;
      }

      // Rule G: Max Prep Time (If specified)
      if (constraints.maxTimeMinutes && !options.relaxTime) {
        if (meal.prepTimeMinutes + meal.cookTimeMinutes > constraints.maxTimeMinutes + 5) {
          return false;
        }
      }

      return true;
    };

    // Filter strictly
    let exactCandidates = allMeals.filter((m) => matchesHardConstraints(m));
    let exactMatchFound = true;
    let relaxedReason = null;
    let candidates = exactCandidates;

    // 3. NO-MATCH FALLBACK: If strict constraints yielded 0, gracefully relax softest constraint
    if (candidates.length === 0) {
      exactMatchFound = false;

      // Try relaxing cuisine first if specified
      if (constraints.requestedCuisine) {
        candidates = allMeals.filter((m) => matchesHardConstraints(m, { relaxCuisine: true }));
        if (candidates.length > 0) {
          relaxedReason = `No exact ${constraints.requestedCuisine} recipes matched all limits. Showing closest dishes from other cuisines.`;
        }
      }

      // If still 0, try relaxing max calories slightly (+15%)
      if (candidates.length === 0 && constraints.maxCalories) {
        const expandedCal = Math.round(constraints.maxCalories * 1.15);
        candidates = allMeals.filter((m) => {
          if (m.calories > expandedCal) return false;
          return matchesHardConstraints(m, { relaxCalories: true, relaxProtein: true });
        });
        if (candidates.length > 0) {
          relaxedReason = `No dishes found under ${constraints.maxCalories} kcal meeting all criteria. Showing closest options at ${expandedCal} kcal.`;
        }
      }

      // If still 0, keep dietary & slot strict, but show closest valid dishes
      if (candidates.length === 0) {
        candidates = allMeals.filter((m) => {
          const tags = JSON.parse(m.dietaryTags || "[]");
          if (constraints.diet === "vegan" && !tags.includes("Vegan")) return false;
          if (constraints.diet === "vegetarian" && !(tags.includes("Vegetarian") || tags.includes("Vegan"))) return false;
          if (constraints.requestedSlot && constraints.requestedSlot === "dinner" && (m.mealType === "breakfast" || m.mealType === "snack")) return false;
          return true;
        });
        relaxedReason = "No exact recipes matched all strict parameters. Showing the closest nutritious alternatives.";
      }
    }

    // 4. DETERMINISTIC RANKING: Score candidates based on query intent
    candidates.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Priority 1: High Protein Density (protein per 100 kcal)
      // This ensures a 380 kcal / 42g protein dish beats a 580 kcal / 45g protein dish for "low calorie high protein"!
      const densityA = (a.protein / (a.calories / 100));
      const densityB = (b.protein / (b.calories / 100));

      if (constraints.proteinPreference === "high" || constraints.caloriePreference === "low") {
        scoreA += densityA * 15;
        scoreB += densityB * 15;
      }

      // Priority 2: Calorie fit
      if (constraints.maxCalories) {
        // Reward staying well under or close to maxCalories without exceeding it
        scoreA += (constraints.maxCalories - a.calories) * 0.05;
        scoreB += (constraints.maxCalories - b.calories) * 0.05;
      }

      // Priority 3: Exact Slot Match bonus
      if (constraints.requestedSlot && a.mealType === constraints.requestedSlot) scoreA += 25;
      if (constraints.requestedSlot && b.mealType === constraints.requestedSlot) scoreB += 25;

      // Priority 4: Cuisine Match bonus
      if (constraints.requestedCuisine) {
        if (a.cuisine.toLowerCase().includes(constraints.requestedCuisine.toLowerCase())) scoreA += 30;
        if (b.cuisine.toLowerCase().includes(constraints.requestedCuisine.toLowerCase())) scoreB += 30;
      }

      // Priority 5: Raw protein bonus
      scoreA += a.protein * 0.5;
      scoreB += b.protein * 0.5;

      return scoreB - scoreA;
    });

    const formatMeal = (m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      imageUrl: m.imageUrl,
      calories: m.calories,
      protein: m.protein,
      carbs: m.carbs,
      fat: m.fat,
      prepTimeMinutes: m.prepTimeMinutes,
      cookTimeMinutes: m.cookTimeMinutes,
      cuisine: m.cuisine,
      mealType: m.mealType,
      dietaryTags: JSON.parse(m.dietaryTags || "[]"),
      instructions: JSON.parse(m.instructions || "[]"),
      ingredients: (m.ingredients || []).map((i) => ({
        name: i.ingredient?.name || i.name,
        amount: i.amount,
        unit: i.unit,
        category: i.ingredient?.category || "Pantry",
      })),
      calorieDifference: constraints.maxCalories ? m.calories - constraints.maxCalories : 0,
      proteinDifference: constraints.minProtein ? Math.round((m.protein - constraints.minProtein) * 10) / 10 : 0,
    });

    const bestMealRaw = candidates[0] || null;
    const alternativesRaw = candidates.slice(1, 4);

    const bestMatch = bestMealRaw ? formatMeal(bestMealRaw) : null;
    const recommendations = alternativesRaw.map(formatMeal);

    // 5. GENERATE PERSONALIZED EXPLANATION GROUNDED IN DATABASE RECORD
    let headline = "";
    let reason = "";
    let nutritionTip = "";

    if (bestMatch) {
      const slotLabel = constraints.requestedSlot
        ? constraints.requestedSlot.charAt(0).toUpperCase() + constraints.requestedSlot.slice(1)
        : bestMatch.mealType.charAt(0).toUpperCase() + bestMatch.mealType.slice(1);

      if (exactMatchFound) {
        if (constraints.caloriePreference === "low" && constraints.proteinPreference === "high") {
          headline = `Top Low-Calorie, High-Protein ${slotLabel}`;
          reason = `Delivers ${bestMatch.protein}g protein at only ${bestMatch.calories} kcal, achieving an outstanding protein-to-calorie ratio without excess carbs or fat.`;
          nutritionTip = `Rich in lean amino acids while strictly respecting your calorie ceiling.`;
        } else if (constraints.diet === "vegetarian") {
          headline = `Ideal Vegetarian ${slotLabel}`;
          reason = `100% vegetarian, providing ${bestMatch.protein}g wholesome plant protein at ${bestMatch.calories} kcal.`;
          nutritionTip = `Packed with nutrient-dense ${bestMatch.cuisine} ingredients and zero meat.`;
        } else if (constraints.diet === "vegan") {
          headline = `Ideal 100% Plant-Based ${slotLabel}`;
          reason = `Delivers ${bestMatch.protein}g plant protein at ${bestMatch.calories} kcal with zero animal products.`;
          nutritionTip = `Clean, wholesome, and completely vegan-certified.`;
        } else {
          headline = `Best Grounded Match for ${slotLabel}`;
          reason = `Selected from our database: provides ${bestMatch.protein}g protein at ${bestMatch.calories} kcal, fitting your current request.`;
          nutritionTip = `Takes only ${bestMatch.prepTimeMinutes + bestMatch.cookTimeMinutes} minutes to prepare.`;
        }
      } else {
        headline = "Closest Available Match";
        reason = relaxedReason || `Closest match meeting your dietary criteria at ${bestMatch.calories} kcal and ${bestMatch.protein}g protein.`;
        nutritionTip = "All ingredients and nutrition values are sourced directly from our curated recipe database.";
      }

      // Try OpenAI for conversational enrichment if configured
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

      if (aiJson?.headline && aiJson?.reason) {
        headline = aiJson.headline;
        reason = aiJson.reason;
        if (aiJson.nutritionTip) nutritionTip = aiJson.nutritionTip;
      }
    } else {
      headline = "No Recipes Found";
      reason = "We could not find any recipes meeting your constraints in the database.";
      nutritionTip = "Try relaxing some filters or browsing the full catalog in Meal Finder.";
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
router.post("/cook-with-ingredients", authenticateToken, async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: "List of ingredients is required" });
    }

    const normalizedInputs = ingredients.map((i) => i.toLowerCase().trim()).filter(Boolean);

    // Fetch all meals with ingredients from the expanded database
    const meals = await prisma.meal.findMany({
      include: {
        ingredients: {
          include: { ingredient: true },
        },
      },
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

    // Sort by highest match count and percentage
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

// GET /api/ai/quick-copilot-recommendation (For Dashboard Brain)
router.get("/quick-copilot-recommendation", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const todayIso = new Date().toISOString().split("T")[0];

    const [profile, logs, allMeals] = await Promise.all([
      prisma.profile.findUnique({ where: { userId } }),
      prisma.mealLog.findMany({ where: { userId, date: todayIso } }),
      prisma.meal.findMany({
        include: { ingredients: { include: { ingredient: true } } },
      }),
    ]);

    const consumedCalories = logs.reduce((sum, l) => sum + l.calories, 0);
    const consumedProtein = logs.reduce((sum, l) => sum + l.protein, 0);
    const targetCalories = profile?.dailyCalorieTarget || 2000;
    const targetProtein = profile?.proteinTarget || 120;
    const remainingCalories = Math.max(0, targetCalories - consumedCalories);
    const remainingProtein = Math.max(0, targetProtein - consumedProtein);

    // Determine next meal slot
    const loggedSlots = new Set(logs.map((l) => l.slot.toLowerCase()));
    let nextSlot = "dinner";
    if (!loggedSlots.has("breakfast")) nextSlot = "breakfast";
    else if (!loggedSlots.has("lunch")) nextSlot = "lunch";
    else if (!loggedSlots.has("dinner")) nextSlot = "dinner";
    else nextSlot = "snack";

    // Filter meals matching profile diet & next slot
    let candidates = allMeals.filter((m) => {
      const tags = JSON.parse(m.dietaryTags || "[]");
      if (profile?.dietPreference === "vegetarian" && !(tags.includes("Vegetarian") || tags.includes("Vegan"))) return false;
      if (profile?.dietPreference === "vegan" && !tags.includes("Vegan")) return false;
      if (profile?.dietPreference === "keto" && !tags.includes("Keto")) return false;
      if (nextSlot === "breakfast" && m.mealType !== "breakfast") return false;
      if (nextSlot === "lunch" && m.mealType !== "lunch" && m.mealType !== "dinner") return false;
      if (nextSlot === "dinner" && (m.mealType === "breakfast" || m.mealType === "snack")) return false;
      return true;
    });

    if (candidates.length === 0) candidates = allMeals;

    // Pick best match that fits remaining calories or prioritizes protein density
    candidates.sort((a, b) => {
      const diffA = Math.abs(a.calories - remainingCalories);
      const diffB = Math.abs(b.calories - remainingCalories);
      return diffA - diffB || b.protein - a.protein;
    });

    const chosen = candidates[0];

    res.json({
      remainingCalories,
      remainingProtein,
      nextSlot,
      recommendation: {
        id: chosen.id,
        title: chosen.title,
        description: chosen.description,
        imageUrl: chosen.imageUrl,
        calories: chosen.calories,
        protein: chosen.protein,
        carbs: chosen.carbs,
        fat: chosen.fat,
        prepTimeMinutes: chosen.prepTimeMinutes,
        cookTimeMinutes: chosen.cookTimeMinutes,
        cuisine: chosen.cuisine,
        mealType: chosen.mealType,
        dietaryTags: JSON.parse(chosen.dietaryTags || "[]"),
        instructions: JSON.parse(chosen.instructions || "[]"),
        ingredients: chosen.ingredients.map((i) => ({
          name: i.ingredient?.name,
          amount: i.amount,
          unit: i.unit,
        })),
      },
    });
  } catch (error) {
    console.error("Quick copilot error:", error);
    res.status(500).json({ error: "Failed to load copilot recommendation" });
  }
});

export default router;
