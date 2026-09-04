import express from "express";
import prisma from "../config/prisma.js";
import { authenticateToken } from "../middleware/auth.js";
import { calculateNutritionTargets } from "../utils/nutritionCalculator.js";

const router = express.Router();

// GET /api/profile
router.get("/", authenticateToken, async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.id },
    });
    res.json({ profile, user: { id: req.user.id, name: req.user.name, email: req.user.email } });
  } catch (error) {
    console.error("Fetch profile error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// PUT /api/profile
router.put("/", authenticateToken, async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      weight,
      height,
      activityLevel,
      goal,
      dietPreference,
      allergies,
      dislikedFoods,
      cuisines,
      mealsPerDay,
      cookingTimePreference,
      weeklyBudget,
      autoRecalculateTargets = true,
      dailyCalorieTarget,
      proteinTarget,
      carbsTarget,
      fatTarget,
      waterTargetMl,
    } = req.body;

    if (name) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { name },
      });
    }

    let calculatedTargets = {};
    if (autoRecalculateTargets) {
      calculatedTargets = calculateNutritionTargets({
        age: age ? Number(age) : req.user.profile?.age || 25,
        gender: gender || req.user.profile?.gender || "male",
        weight: weight ? Number(weight) : req.user.profile?.weight || 70,
        height: height ? Number(height) : req.user.profile?.height || 175,
        activityLevel: activityLevel || req.user.profile?.activityLevel || "moderate",
        goal: goal || req.user.profile?.goal || "healthy_eating",
        dietPreference: dietPreference || req.user.profile?.dietPreference || "omnivore",
      });
    } else {
      if (dailyCalorieTarget) calculatedTargets.dailyCalorieTarget = Number(dailyCalorieTarget);
      if (proteinTarget) calculatedTargets.proteinTarget = Number(proteinTarget);
      if (carbsTarget) calculatedTargets.carbsTarget = Number(carbsTarget);
      if (fatTarget) calculatedTargets.fatTarget = Number(fatTarget);
      if (waterTargetMl) calculatedTargets.waterTargetMl = Number(waterTargetMl);
    }

    const updatedProfile = await prisma.profile.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id,
        age: age ? Number(age) : null,
        gender,
        weight: weight ? Number(weight) : null,
        height: height ? Number(height) : null,
        activityLevel,
        goal,
        dietPreference,
        allergies: typeof allergies === "string" ? allergies : JSON.stringify(allergies || []),
        dislikedFoods: typeof dislikedFoods === "string" ? dislikedFoods : JSON.stringify(dislikedFoods || []),
        cuisines: typeof cuisines === "string" ? cuisines : JSON.stringify(cuisines || []),
        mealsPerDay: mealsPerDay ? Number(mealsPerDay) : 3,
        cookingTimePreference: cookingTimePreference ? Number(cookingTimePreference) : 30,
        weeklyBudget: weeklyBudget ? Number(weeklyBudget) : 75,
        ...calculatedTargets,
      },
      update: {
        ...(age !== undefined && { age: Number(age) }),
        ...(gender !== undefined && { gender }),
        ...(weight !== undefined && { weight: Number(weight) }),
        ...(height !== undefined && { height: Number(height) }),
        ...(activityLevel !== undefined && { activityLevel }),
        ...(goal !== undefined && { goal }),
        ...(dietPreference !== undefined && { dietPreference }),
        ...(allergies !== undefined && { allergies: typeof allergies === "string" ? allergies : JSON.stringify(allergies) }),
        ...(dislikedFoods !== undefined && { dislikedFoods: typeof dislikedFoods === "string" ? dislikedFoods : JSON.stringify(dislikedFoods) }),
        ...(cuisines !== undefined && { cuisines: typeof cuisines === "string" ? cuisines : JSON.stringify(cuisines) }),
        ...(mealsPerDay !== undefined && { mealsPerDay: Number(mealsPerDay) }),
        ...(cookingTimePreference !== undefined && { cookingTimePreference: Number(cookingTimePreference) }),
        ...(weeklyBudget !== undefined && { weeklyBudget: Number(weeklyBudget) }),
        ...calculatedTargets,
      },
    });

    res.json({
      message: "Profile updated successfully",
      profile: updatedProfile,
      user: { id: req.user.id, name: name || req.user.name, email: req.user.email },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
