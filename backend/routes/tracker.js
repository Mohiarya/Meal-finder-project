import express from "express";
import prisma from "../config/prisma.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

function getTodayIso() {
  return new Date().toISOString().split("T")[0];
}

// GET /api/tracker/today
router.get("/today", authenticateToken, async (req, res) => {
  try {
    const date = req.query.date || getTodayIso();
    const userId = req.user.id;

    const [logs, waterLog, profile] = await Promise.all([
      prisma.mealLog.findMany({
        where: { userId, date },
        include: { meal: true },
        orderBy: { loggedAt: "asc" },
      }),
      prisma.waterLog.findUnique({
        where: { userId_date: { userId, date } },
      }),
      prisma.profile.findUnique({
        where: { userId },
      }),
    ]);

    let consumedCalories = 0;
    let consumedProtein = 0;
    let consumedCarbs = 0;
    let consumedFat = 0;

    const mealsBySlot = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };

    logs.forEach((log) => {
      consumedCalories += log.calories;
      consumedProtein += log.protein;
      consumedCarbs += log.carbs;
      consumedFat += log.fat;

      const slot = (log.slot || "snack").toLowerCase();
      if (mealsBySlot[slot]) {
        mealsBySlot[slot].push(log);
      } else {
        mealsBySlot.snack.push(log);
      }
    });

    const targetCalories = profile?.dailyCalorieTarget || 2000;
    const targetProtein = profile?.proteinTarget || 120;
    const targetCarbs = profile?.carbsTarget || 220;
    const targetFat = profile?.fatTarget || 65;
    const targetWater = profile?.waterTargetMl || 2500;
    const currentWater = waterLog?.amountMl || 0;

    res.json({
      date,
      nutrition: {
        calories: {
          consumed: Math.round(consumedCalories),
          target: targetCalories,
          remaining: Math.max(0, targetCalories - Math.round(consumedCalories)),
          percentage: Math.min(100, Math.round((consumedCalories / targetCalories) * 100)),
        },
        protein: {
          consumed: Math.round(consumedProtein * 10) / 10,
          target: targetProtein,
          remaining: Math.max(0, targetProtein - Math.round(consumedProtein)),
          percentage: Math.min(100, Math.round((consumedProtein / targetProtein) * 100)),
        },
        carbs: {
          consumed: Math.round(consumedCarbs * 10) / 10,
          target: targetCarbs,
          remaining: Math.max(0, targetCarbs - Math.round(consumedCarbs)),
          percentage: Math.min(100, Math.round((consumedCarbs / targetCarbs) * 100)),
        },
        fat: {
          consumed: Math.round(consumedFat * 10) / 10,
          target: targetFat,
          remaining: Math.max(0, targetFat - Math.round(consumedFat)),
          percentage: Math.min(100, Math.round((consumedFat / targetFat) * 100)),
        },
      },
      hydration: {
        currentMl: currentWater,
        targetMl: targetWater,
        percentage: Math.min(100, Math.round((currentWater / targetWater) * 100)),
      },
      mealsBySlot,
      logsCount: logs.length,
    });
  } catch (error) {
    console.error("Error fetching today's tracker:", error);
    res.status(500).json({ error: "Failed to fetch tracker data" });
  }
});

// POST /api/tracker/log-meal
router.post("/log-meal", authenticateToken, async (req, res) => {
  try {
    const { mealId, slot = "lunch", servings = 1, customTitle, calories, protein, carbs, fat, date } = req.body;
    const effectiveDate = date || getTodayIso();

    let mealData = {
      mealTitle: customTitle || "Quick Meal",
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
    };

    if (mealId) {
      const meal = await prisma.meal.findUnique({ where: { id: mealId } });
      if (meal) {
        const mult = Number(servings) || 1;
        mealData = {
          mealTitle: meal.title,
          calories: Math.round(meal.calories * mult),
          protein: Math.round(meal.protein * mult * 10) / 10,
          carbs: Math.round(meal.carbs * mult * 10) / 10,
          fat: Math.round(meal.fat * mult * 10) / 10,
        };
      }
    }

    const log = await prisma.mealLog.create({
      data: {
        userId: req.user.id,
        mealId: mealId || null,
        mealTitle: mealData.mealTitle,
        slot: slot.toLowerCase(),
        date: effectiveDate,
        calories: mealData.calories,
        protein: mealData.protein,
        carbs: mealData.carbs,
        fat: mealData.fat,
        servings: Number(servings) || 1,
      },
      include: { meal: true },
    });

    res.status(201).json({ message: "Meal logged successfully", log });
  } catch (error) {
    console.error("Error logging meal:", error);
    res.status(500).json({ error: "Failed to log meal" });
  }
});

// DELETE /api/tracker/log-meal/:id
router.delete("/log-meal/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.mealLog.deleteMany({
      where: { id, userId: req.user.id },
    });
    res.json({ message: "Log entry deleted" });
  } catch (error) {
    console.error("Error deleting log:", error);
    res.status(500).json({ error: "Failed to delete log entry" });
  }
});

// POST /api/tracker/water
router.post("/water", authenticateToken, async (req, res) => {
  try {
    const { amountMl, deltaMl, date } = req.body;
    const effectiveDate = date || getTodayIso();

    const existing = await prisma.waterLog.findUnique({
      where: { userId_date: { userId: req.user.id, date: effectiveDate } },
    });

    let newAmount = 0;
    if (deltaMl !== undefined) {
      newAmount = Math.max(0, (existing?.amountMl || 0) + Number(deltaMl));
    } else if (amountMl !== undefined) {
      newAmount = Math.max(0, Number(amountMl));
    }

    const waterLog = await prisma.waterLog.upsert({
      where: { userId_date: { userId: req.user.id, date: effectiveDate } },
      create: {
        userId: req.user.id,
        date: effectiveDate,
        amountMl: newAmount,
      },
      update: {
        amountMl: newAmount,
      },
    });

    res.json({ message: "Water logged successfully", waterLog });
  } catch (error) {
    console.error("Error logging water:", error);
    res.status(500).json({ error: "Failed to update water log" });
  }
});

// GET /api/tracker/analytics/weekly
router.get("/analytics/weekly", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    const targetCalories = profile?.dailyCalorieTarget || 2000;
    const targetProtein = profile?.proteinTarget || 120;
    const targetWater = profile?.waterTargetMl || 2500;

    // Generate last 7 days dates
    const days = [];
    const dateLabels = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split("T")[0];
      const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
      days.push(iso);
      dateLabels.push({ iso, weekday });
    }

    const [logs, waterLogs] = await Promise.all([
      prisma.mealLog.findMany({
        where: {
          userId,
          date: { in: days },
        },
      }),
      prisma.waterLog.findMany({
        where: {
          userId,
          date: { in: days },
        },
      }),
    ]);

    // Aggregate by day
    const chartData = dateLabels.map(({ iso, weekday }) => {
      const dayLogs = logs.filter((l) => l.date === iso);
      const dayWater = waterLogs.find((w) => w.date === iso);

      const calories = dayLogs.reduce((sum, l) => sum + l.calories, 0);
      const protein = dayLogs.reduce((sum, l) => sum + l.protein, 0);
      const carbs = dayLogs.reduce((sum, l) => sum + l.carbs, 0);
      const fat = dayLogs.reduce((sum, l) => sum + l.fat, 0);
      const water = dayWater ? dayWater.amountMl : 0;

      return {
        date: iso,
        day: weekday,
        calories: Math.round(calories),
        targetCalories,
        protein: Math.round(protein),
        targetProtein,
        carbs: Math.round(carbs),
        fat: Math.round(fat),
        water,
        targetWater,
        mealsLogged: dayLogs.length,
      };
    });

    // Compute averages & insights
    const activeDaysWithLogs = chartData.filter((d) => d.mealsLogged > 0);
    const avgCalories = activeDaysWithLogs.length
      ? Math.round(activeDaysWithLogs.reduce((s, d) => s + d.calories, 0) / activeDaysWithLogs.length)
      : 0;
    const avgProtein = activeDaysWithLogs.length
      ? Math.round(activeDaysWithLogs.reduce((s, d) => s + d.protein, 0) / activeDaysWithLogs.length)
      : 0;
    const proteinGoalDays = chartData.filter((d) => d.protein >= targetProtein * 0.9).length;
    const hydrationGoalDays = chartData.filter((d) => d.water >= targetWater * 0.85).length;

    const insights = [
      avgCalories > 0
        ? `Averaging ${avgCalories.toLocaleString()} kcal/day across active days (${Math.round((avgCalories / targetCalories) * 100)}% of your target).`
        : "Start logging your daily meals to unlock detailed calorie trend analysis.",
      proteinGoalDays > 0
        ? `Met your protein benchmark on ${proteinGoalDays} of the last 7 days.`
        : "Prioritize high-protein snacks or breakfasts to reach your daily protein goal.",
      hydrationGoalDays >= 4
        ? `Excellent hydration consistency: hit target water volume ${hydrationGoalDays} days this week.`
        : `Stay hydrated: aim for ${targetWater / 1000}L per day with regular water reminders.`,
    ];

    res.json({
      chartData,
      summary: {
        avgCalories,
        avgProtein,
        targetCalories,
        targetProtein,
        proteinGoalDays,
        hydrationGoalDays,
        totalMealsLogged: logs.length,
      },
      insights,
    });
  } catch (error) {
    console.error("Error generating analytics:", error);
    res.status(500).json({ error: "Failed to generate analytics" });
  }
});

export default router;
