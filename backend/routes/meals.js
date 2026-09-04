import express from "express";
import prisma from "../config/prisma.js";
import { optionalAuth } from "../middleware/auth.js";
import { recipeSearchLimiter } from "../middleware/rateLimiters.js";
import { searchRecipes } from "../services/recipeProvider.js";

const router = express.Router();

// Below this many local matches for a genuine free-text search, try the
// external recipe provider too. Filter dropdowns alone (cuisine/mealType/
// calorie/protein with no search text) never trigger it — only a named
// dish search that the local 110-recipe catalog can't cover does.
const MIN_LOCAL_SEARCH_RESULTS = 5;

// GET /api/meals — public browsing, but personalizes favorite-status for
// whoever the *token* says is logged in. Never derives that from a query
// param: an unauthenticated caller can no longer probe "did user X
// favorite meal Y" by passing an arbitrary ?userId=.
router.get("/", optionalAuth, recipeSearchLimiter, async (req, res) => {
  try {
    const {
      search,
      cuisine,
      mealType,
      dietaryTag,
      maxCalories,
      minProtein,
      maxPrepTime,
      sortBy,
    } = req.query;
    const userId = req.user?.id;

    const where = {};

    if (cuisine && cuisine !== "All") {
      where.cuisine = cuisine;
    }

    if (mealType && mealType !== "All") {
      where.mealType = mealType.toLowerCase();
    }

    if (maxCalories) {
      where.calories = { lte: Number(maxCalories) };
    }

    if (minProtein) {
      where.protein = { gte: Number(minProtein) };
    }

    if (maxPrepTime) {
      where.prepTimeMinutes = { lte: Number(maxPrepTime) };
    }

    let meals = await prisma.meal.findMany({
      where,
      include: {
        ingredients: {
          include: { ingredient: true },
        },
      },
      orderBy: { calories: "asc" },
    });

    // Client-side / in-memory tag and text search filtering for accuracy
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      meals = meals.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.cuisine.toLowerCase().includes(q) ||
          m.ingredients.some((i) => i.ingredient.name.toLowerCase().includes(q))
      );
    }

    // Hybrid fallback: a real search term ("chicken biryani", "chocolate
    // cake") that the local catalog barely or doesn't cover falls through
    // to the external recipe provider — see recipeProvider.searchRecipes.
    // The same cuisine/mealType/calorie/protein filters the user picked
    // are carried over so external results respect them too.
    let usedExternal = false;
    if (search && search.trim() && meals.length < MIN_LOCAL_SEARCH_RESULTS) {
      const hybridConstraints = {
        requestedSlot: mealType && mealType !== "All" ? mealType.toLowerCase() : null,
        maxCalories: maxCalories ? Number(maxCalories) : null,
        caloriePreference: "balanced",
        minProtein: minProtein ? Number(minProtein) : null,
        proteinPreference: "standard",
        diet: null,
        requestedCuisine: cuisine && cuisine !== "All" ? cuisine : null,
        maxTimeMinutes: maxPrepTime ? Number(maxPrepTime) : null,
        excludedTerms: [],
      };
      const allMealsForHybrid = await prisma.meal.findMany({
        include: { ingredients: { include: { ingredient: true } } },
      });
      const hybrid = await searchRecipes({
        rawQuery: search,
        constraints: hybridConstraints,
        allMeals: allMealsForHybrid,
        minResults: MIN_LOCAL_SEARCH_RESULTS,
        // The search box is always a dish-name/keyword field, distinct
        // from the cuisine/calorie/mealType filter controls (which have
        // non-empty defaults regardless of user intent) — text relevance
        // must always gate a search term here. See searchLocalRecipes's
        // own comment for why this differs from the AI Assistant's call.
        requireTextMatch: true,
      });
      const existingIds = new Set(meals.map((m) => m.id));
      const additions = hybrid.results.filter((m) => !existingIds.has(m.id));
      meals = [...meals, ...additions];
      usedExternal = hybrid.usedExternal;
    }

    if (dietaryTag && dietaryTag !== "All") {
      meals = meals.filter((m) => {
        try {
          const tags = JSON.parse(m.dietaryTags);
          return tags.includes(dietaryTag);
        } catch {
          return false;
        }
      });
    }

    // If userId provided, check favorite status
    let favoriteMealIds = new Set();
    if (userId) {
      const favs = await prisma.favorite.findMany({
        where: { userId },
        select: { mealId: true },
      });
      favoriteMealIds = new Set(favs.map((f) => f.mealId));
    }

    const formatted = meals.map((m) => ({
      ...m,
      dietaryTags: JSON.parse(m.dietaryTags || "[]"),
      instructions: JSON.parse(m.instructions || "[]"),
      isFavorite: favoriteMealIds.has(m.id),
      // Favoriting only exists for real local rows (a FK to Meal) — an
      // external recipe's id is a synthetic string, so it's never a match
      // and isFavorite correctly stays false rather than erroring.
      source: m.source || "local",
      sourceUrl: m.sourceUrl || null,
      sourceName: m.sourceName || null,
    }));

    if (sortBy === "calories_desc") formatted.sort((a, b) => b.calories - a.calories);
    else if (sortBy === "protein_desc") formatted.sort((a, b) => b.protein - a.protein);
    else if (sortBy === "prep_asc") formatted.sort((a, b) => a.prepTimeMinutes - b.prepTimeMinutes);
    else if (sortBy === "title_asc") formatted.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortBy === "calories_asc") formatted.sort((a, b) => a.calories - b.calories);

    res.json({ count: formatted.length, meals: formatted, usedExternal });
  } catch (error) {
    console.error("Error fetching meals:", error);
    res.status(500).json({ error: "Failed to fetch meals" });
  }
});

// GET /api/meals/:id
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const meal = await prisma.meal.findUnique({
      where: { id },
      include: {
        ingredients: {
          include: { ingredient: true },
        },
      },
    });

    if (!meal) {
      return res.status(404).json({ error: "Meal not found" });
    }

    let isFavorite = false;
    if (userId) {
      const fav = await prisma.favorite.findUnique({
        where: { userId_mealId: { userId, mealId: id } },
      });
      isFavorite = !!fav;
    }

    res.json({
      meal: {
        ...meal,
        dietaryTags: JSON.parse(meal.dietaryTags || "[]"),
        instructions: JSON.parse(meal.instructions || "[]"),
        isFavorite,
      },
    });
  } catch (error) {
    console.error("Error fetching meal details:", error);
    res.status(500).json({ error: "Failed to fetch meal details" });
  }
});

// GET /api/meals/:id/swap-options
router.get("/:id/swap-options", async (req, res) => {
  try {
    const { id } = req.params;
    const { filter } = req.query; // 'higher_protein', 'lower_calorie', 'vegetarian', 'faster'

    const targetMeal = await prisma.meal.findUnique({
      where: { id },
    });

    if (!targetMeal) {
      return res.status(404).json({ error: "Base meal not found" });
    }

    let candidates = await prisma.meal.findMany({
      where: {
        id: { not: id },
        mealType: targetMeal.mealType,
      },
      include: {
        ingredients: { include: { ingredient: true } },
      },
    });

    // If not enough in same mealType, allow other lunches/dinners interchangeably
    if (candidates.length < 3 && (targetMeal.mealType === "lunch" || targetMeal.mealType === "dinner")) {
      candidates = await prisma.meal.findMany({
        where: {
          id: { not: id },
          mealType: { in: ["lunch", "dinner"] },
        },
        include: {
          ingredients: { include: { ingredient: true } },
        },
      });
    }

    // Filter logic
    if (filter === "higher_protein") {
      candidates = candidates.filter((m) => m.protein >= targetMeal.protein);
    } else if (filter === "lower_calorie") {
      candidates = candidates.filter((m) => m.calories <= targetMeal.calories);
    } else if (filter === "vegetarian") {
      candidates = candidates.filter((m) => {
        const tags = JSON.parse(m.dietaryTags || "[]");
        return tags.includes("Vegetarian") || tags.includes("Vegan");
      });
    } else if (filter === "faster") {
      candidates = candidates.filter(
        (m) => m.prepTimeMinutes + m.cookTimeMinutes <= targetMeal.prepTimeMinutes + targetMeal.cookTimeMinutes
      );
    }

    // Sort by calorie closeness to original
    candidates.sort((a, b) => Math.abs(a.calories - targetMeal.calories) - Math.abs(b.calories - targetMeal.calories));

    const results = candidates.slice(0, 6).map((m) => ({
      ...m,
      dietaryTags: JSON.parse(m.dietaryTags || "[]"),
      instructions: JSON.parse(m.instructions || "[]"),
      calorieDifference: m.calories - targetMeal.calories,
      proteinDifference: Math.round((m.protein - targetMeal.protein) * 10) / 10,
    }));

    res.json({ baseMeal: targetMeal, alternatives: results });
  } catch (error) {
    console.error("Error fetching swap alternatives:", error);
    res.status(500).json({ error: "Failed to fetch swap alternatives" });
  }
});

export default router;
