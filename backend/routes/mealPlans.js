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

// GET /api/meal-plans/current
router.get("/current", authenticateToken, async (req, res) => {
  try {
    const weekStartDate = req.query.weekStartDate || getMondayOfCurrentWeek();

    let mealPlan = await prisma.mealPlan.findUnique({
      where: {
        userId_weekStartDate: {
          userId: req.user.id,
          weekStartDate,
        },
      },
      include: {
        plannedMeals: {
          include: {
            meal: {
              include: {
                ingredients: { include: { ingredient: true } },
              },
            },
          },
        },
      },
    });

    if (!mealPlan) {
      mealPlan = await prisma.mealPlan.create({
        data: {
          userId: req.user.id,
          weekStartDate,
        },
        include: {
          plannedMeals: {
            include: {
              meal: {
                include: {
                  ingredients: { include: { ingredient: true } },
                },
              },
            },
          },
        },
      });
    }

    // Format planned meals and compute day totals
    const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    const planByDay = {};

    days.forEach((day) => {
      planByDay[day] = {
        breakfast: null,
        lunch: null,
        dinner: null,
        snack: null,
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
      };
    });

    mealPlan.plannedMeals.forEach((pm) => {
      const day = pm.dayOfWeek.toLowerCase();
      const slot = pm.slot.toLowerCase();
      if (planByDay[day]) {
        const formattedMeal = {
          ...pm.meal,
          dietaryTags: JSON.parse(pm.meal.dietaryTags || "[]"),
          instructions: JSON.parse(pm.meal.instructions || "[]"),
        };

        planByDay[day][slot] = {
          id: pm.id,
          mealId: pm.mealId,
          slot: pm.slot,
          dayOfWeek: pm.dayOfWeek,
          servings: pm.servings,
          isCompleted: pm.isCompleted,
          meal: formattedMeal,
        };

        planByDay[day].totalCalories += Math.round(pm.meal.calories * pm.servings);
        planByDay[day].totalProtein += Math.round(pm.meal.protein * pm.servings * 10) / 10;
        planByDay[day].totalCarbs += Math.round(pm.meal.carbs * pm.servings * 10) / 10;
        planByDay[day].totalFat += Math.round(pm.meal.fat * pm.servings * 10) / 10;
      }
    });

    res.json({
      mealPlanId: mealPlan.id,
      weekStartDate,
      planByDay,
      rawPlannedMeals: mealPlan.plannedMeals,
    });
  } catch (error) {
    console.error("Error fetching weekly meal plan:", error);
    res.status(500).json({ error: "Failed to fetch meal plan" });
  }
});

// POST /api/meal-plans/plan-meal
router.post("/plan-meal", authenticateToken, async (req, res) => {
  try {
    const { mealId, dayOfWeek, slot, servings = 1, weekStartDate } = req.body;
    const effectiveWeek = weekStartDate || getMondayOfCurrentWeek();

    if (!mealId || !dayOfWeek || !slot) {
      return res.status(400).json({ error: "Meal ID, day of week, and slot are required" });
    }

    let mealPlan = await prisma.mealPlan.findUnique({
      where: {
        userId_weekStartDate: {
          userId: req.user.id,
          weekStartDate: effectiveWeek,
        },
      },
    });

    if (!mealPlan) {
      mealPlan = await prisma.mealPlan.create({
        data: {
          userId: req.user.id,
          weekStartDate: effectiveWeek,
        },
      });
    }

    // Check if slot on that day already has a meal -> replace it
    const existing = await prisma.plannedMeal.findFirst({
      where: {
        mealPlanId: mealPlan.id,
        dayOfWeek: dayOfWeek.toLowerCase(),
        slot: slot.toLowerCase(),
      },
    });

    let plannedMeal;
    if (existing) {
      plannedMeal = await prisma.plannedMeal.update({
        where: { id: existing.id },
        data: {
          mealId,
          servings: Number(servings),
          isCompleted: false,
        },
        include: { meal: true },
      });
    } else {
      plannedMeal = await prisma.plannedMeal.create({
        data: {
          mealPlanId: mealPlan.id,
          mealId,
          dayOfWeek: dayOfWeek.toLowerCase(),
          slot: slot.toLowerCase(),
          servings: Number(servings),
        },
        include: { meal: true },
      });
    }

    res.json({ message: "Meal added to plan", plannedMeal });
  } catch (error) {
    console.error("Error planning meal:", error);
    res.status(500).json({ error: "Failed to add meal to plan" });
  }
});

// PUT /api/meal-plans/swap-meal
router.put("/swap-meal", authenticateToken, async (req, res) => {
  try {
    const { plannedMealId, newMealId } = req.body;

    if (!plannedMealId || !newMealId) {
      return res.status(400).json({ error: "Planned meal ID and new meal ID are required" });
    }

    const updated = await prisma.plannedMeal.update({
      where: { id: plannedMealId },
      data: {
        mealId: newMealId,
        isCompleted: false,
      },
      include: { meal: true },
    });

    res.json({ message: "Meal swapped successfully", plannedMeal: updated });
  } catch (error) {
    console.error("Error swapping meal:", error);
    res.status(500).json({ error: "Failed to swap meal" });
  }
});

// DELETE /api/meal-plans/planned-meal/:id
router.delete("/planned-meal/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.plannedMeal.delete({
      where: { id },
    });

    res.json({ message: "Meal removed from plan" });
  } catch (error) {
    console.error("Error removing planned meal:", error);
    res.status(500).json({ error: "Failed to remove meal" });
  }
});

// PATCH /api/meal-plans/planned-meal/:id/complete
router.patch("/planned-meal/:id/complete", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { isCompleted } = req.body;

    const updated = await prisma.plannedMeal.update({
      where: { id },
      data: { isCompleted: Boolean(isCompleted) },
      include: { meal: true },
    });

    // If marked completed, automatically log to today's nutrition diary!
    if (isCompleted) {
      const todayIso = new Date().toISOString().split("T")[0];
      await prisma.mealLog.create({
        data: {
          userId: req.user.id,
          mealId: updated.mealId,
          mealTitle: updated.meal.title,
          slot: updated.slot,
          date: todayIso,
          calories: Math.round(updated.meal.calories * updated.servings),
          protein: Math.round(updated.meal.protein * updated.servings * 10) / 10,
          carbs: Math.round(updated.meal.carbs * updated.servings * 10) / 10,
          fat: Math.round(updated.meal.fat * updated.servings * 10) / 10,
          servings: updated.servings,
        },
      });
    }

    res.json({ message: "Updated meal status", plannedMeal: updated });
  } catch (error) {
    console.error("Error updating completion:", error);
    res.status(500).json({ error: "Failed to update completion status" });
  }
});

// POST /api/meal-plans/duplicate-day
router.post("/duplicate-day", authenticateToken, async (req, res) => {
  try {
    const { fromDay, toDay, weekStartDate } = req.body;
    const effectiveWeek = weekStartDate || getMondayOfCurrentWeek();

    const mealPlan = await prisma.mealPlan.findUnique({
      where: {
        userId_weekStartDate: {
          userId: req.user.id,
          weekStartDate: effectiveWeek,
        },
      },
      include: { plannedMeals: true },
    });

    if (!mealPlan) {
      return res.status(404).json({ error: "Meal plan not found" });
    }

    const sourceMeals = mealPlan.plannedMeals.filter((pm) => pm.dayOfWeek.toLowerCase() === fromDay.toLowerCase());

    // Delete existing target day meals
    await prisma.plannedMeal.deleteMany({
      where: {
        mealPlanId: mealPlan.id,
        dayOfWeek: toDay.toLowerCase(),
      },
    });

    // Copy over source meals
    for (const sm of sourceMeals) {
      await prisma.plannedMeal.create({
        data: {
          mealPlanId: mealPlan.id,
          mealId: sm.mealId,
          dayOfWeek: toDay.toLowerCase(),
          slot: sm.slot,
          servings: sm.servings,
          isCompleted: false,
        },
      });
    }

    res.json({ message: `Duplicated ${sourceMeals.length} meals from ${fromDay} to ${toDay}` });
  } catch (error) {
    console.error("Error duplicating day:", error);
    res.status(500).json({ error: "Failed to duplicate day" });
  }
});

export default router;
