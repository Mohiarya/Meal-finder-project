import express from "express";
import prisma from "../config/prisma.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

function getMondayOfCurrentWeek() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split("T")[0];
}

// GET /api/grocery
router.get("/", authenticateToken, async (req, res) => {
  try {
    const weekStartDate = req.query.weekStartDate || getMondayOfCurrentWeek();
    const userId = req.user.id;

    // Fetch weekly meal plan with planned meals and ingredients
    const mealPlan = await prisma.mealPlan.findUnique({
      where: {
        userId_weekStartDate: {
          userId,
          weekStartDate,
        },
      },
      include: {
        plannedMeals: {
          include: {
            meal: {
              include: {
                ingredients: {
                  include: { ingredient: true },
                },
              },
            },
          },
        },
      },
    });

    // Existing items stored in GroceryItem for this week (checked states and standalone added items)
    const existingItems = await prisma.groceryItem.findMany({
      where: { userId, weekStartDate },
    });
    const existingItemMap = new Map();
    existingItems.forEach((item) => {
      existingItemMap.set(`${item.name.toLowerCase()}__${(item.unit || "").toLowerCase()}`, item);
    });

    // Consolidate duplicate ingredients across all planned meals
    const ingredientAggregation = {};

    if (mealPlan && mealPlan.plannedMeals.length) {
      mealPlan.plannedMeals.forEach((pm) => {
        const servings = pm.servings || 1;
        pm.meal.ingredients.forEach((mi) => {
          const key = `${mi.ingredient.name.toLowerCase()}__${(mi.unit || "").toLowerCase()}`;
          if (!ingredientAggregation[key]) {
            ingredientAggregation[key] = {
              name: mi.ingredient.name,
              category: mi.ingredient.category || "Pantry",
              unit: mi.unit || "",
              totalAmount: 0,
              recipeSources: new Set(),
            };
          }
          ingredientAggregation[key].totalAmount += mi.amount * servings;
          ingredientAggregation[key].recipeSources.add(pm.meal.title);
        });
      });
    }

    // Merge standalone items that might have been added via AI "Cook With What I Have"
    existingItems.forEach((item) => {
      const key = `${item.name.toLowerCase()}__${(item.unit || "").toLowerCase()}`;
      if (!ingredientAggregation[key]) {
        ingredientAggregation[key] = {
          name: item.name,
          category: item.category || "Pantry",
          unit: item.unit || "",
          totalAmount: item.totalAmount || 1,
          recipeSources: new Set(["Pantry / Manual Add"]),
          standaloneId: item.id,
        };
      }
    });

    // Build finalized items list
    const items = [];
    for (const key of Object.keys(ingredientAggregation)) {
      const agg = ingredientAggregation[key];
      const savedItem = existingItemMap.get(key);
      const isChecked = savedItem ? savedItem.isChecked : false;
      const roundedAmount = Math.round(agg.totalAmount * 10) / 10;

      items.push({
        id: key,
        name: agg.name,
        category: agg.category,
        amount: roundedAmount,
        unit: agg.unit,
        isChecked,
        usedIn: Array.from(agg.recipeSources),
      });
    }

    // Group by category
    const categoryOrder = ["Produce", "Protein", "Dairy", "Grains", "Pantry", "Spices", "Other"];
    const categories = {};
    categoryOrder.forEach((c) => (categories[c] = []));

    items.forEach((item) => {
      const cat = categories[item.category] ? item.category : "Other";
      categories[cat].push(item);
    });

    // Remove empty categories
    Object.keys(categories).forEach((c) => {
      if (categories[c].length === 0) delete categories[c];
    });

    res.json({
      weekStartDate,
      totalItems: items.length,
      checkedCount: items.filter((i) => i.isChecked).length,
      categories,
      items,
    });
  } catch (error) {
    console.error("Error generating grocery list:", error);
    res.status(500).json({ error: "Failed to generate grocery list" });
  }
});

// POST /api/grocery/add-items
router.post("/add-items", authenticateToken, async (req, res) => {
  try {
    const { items, weekStartDate } = req.body;
    const effectiveWeek = weekStartDate || getMondayOfCurrentWeek();
    const userId = req.user.id;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Array of items required" });
    }

    for (const it of items) {
      const name = it.name?.trim() || "Item";
      const unit = it.unit?.trim() || "";
      const amount = Number(it.amount) || 1;
      const category = it.category || "Pantry";

      const existing = await prisma.groceryItem.findFirst({
        where: {
          userId,
          weekStartDate: effectiveWeek,
          name: { equals: name },
          unit: { equals: unit },
        },
      });

      if (existing) {
        await prisma.groceryItem.update({
          where: { id: existing.id },
          data: {
            totalAmount: existing.totalAmount + amount,
            isChecked: false,
          },
        });
      } else {
        await prisma.groceryItem.create({
          data: {
            userId,
            weekStartDate: effectiveWeek,
            name,
            unit,
            totalAmount: amount,
            category,
            isChecked: false,
          },
        });
      }
    }

    res.json({ message: `Successfully added ${items.length} ingredients to grocery list` });
  } catch (error) {
    console.error("Error adding grocery items:", error);
    res.status(500).json({ error: "Failed to add items to grocery list" });
  }
});

// POST /api/grocery/toggle
router.post("/toggle", authenticateToken, async (req, res) => {
  try {
    const { name, unit, isChecked, weekStartDate } = req.body;
    const effectiveWeek = weekStartDate || getMondayOfCurrentWeek();

    const existing = await prisma.groceryItem.findFirst({
      where: {
        userId: req.user.id,
        weekStartDate: effectiveWeek,
        name,
        unit: unit || "",
      },
    });

    if (existing) {
      await prisma.groceryItem.update({
        where: { id: existing.id },
        data: { isChecked: Boolean(isChecked) },
      });
    } else {
      await prisma.groceryItem.create({
        data: {
          userId: req.user.id,
          weekStartDate: effectiveWeek,
          name,
          unit: unit || "",
          totalAmount: 1,
          isChecked: Boolean(isChecked),
        },
      });
    }

    res.json({ message: "Item toggled", name, isChecked });
  } catch (error) {
    console.error("Error toggling grocery item:", error);
    res.status(500).json({ error: "Failed to update item" });
  }
});

// POST /api/grocery/clear-checked
router.post("/clear-checked", authenticateToken, async (req, res) => {
  try {
    const { weekStartDate } = req.body;
    const effectiveWeek = weekStartDate || getMondayOfCurrentWeek();

    await prisma.groceryItem.updateMany({
      where: {
        userId: req.user.id,
        weekStartDate: effectiveWeek,
      },
      data: { isChecked: false },
    });

    res.json({ message: "Cleared checked items" });
  } catch (error) {
    console.error("Error resetting grocery items:", error);
    res.status(500).json({ error: "Failed to clear checked items" });
  }
});

export default router;
