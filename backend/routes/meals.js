import express from "express";
import prisma from "../config/prisma.js";

const router = express.Router();

// GET /api/meals
router.get("/", async (req, res) => {
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
      userId,
    } = req.query;

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
    }));

    if (sortBy === "calories_desc") formatted.sort((a, b) => b.calories - a.calories);
    else if (sortBy === "protein_desc") formatted.sort((a, b) => b.protein - a.protein);
    else if (sortBy === "prep_asc") formatted.sort((a, b) => a.prepTimeMinutes - b.prepTimeMinutes);
    else if (sortBy === "title_asc") formatted.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortBy === "calories_asc") formatted.sort((a, b) => a.calories - b.calories);

    res.json({ count: formatted.length, meals: formatted });
  } catch (error) {
    console.error("Error fetching meals:", error);
    res.status(500).json({ error: "Failed to fetch meals" });
  }
});

// GET /api/meals/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

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
