export function calculateNutritionTargets({
  age = 25,
  gender = "male",
  weight = 70, // kg
  height = 175, // cm
  activityLevel = "moderate",
  goal = "healthy_eating",
  dietPreference = "omnivore"
}) {
  const safeWeight = Number(weight) > 30 ? Number(weight) : 70;
  const safeHeight = Number(height) > 100 ? Number(height) : 175;
  const safeAge = Number(age) > 10 ? Number(age) : 25;

  // Mifflin-St Jeor Equation
  let bmr;
  if (gender === "female") {
    bmr = 10 * safeWeight + 6.25 * safeHeight - 5 * safeAge - 161;
  } else {
    bmr = 10 * safeWeight + 6.25 * safeHeight - 5 * safeAge + 5;
  }

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const multiplier = activityMultipliers[activityLevel] || 1.55;
  let tdee = Math.round(bmr * multiplier);

  // Goal adjustment
  if (goal === "weight_loss") {
    tdee = Math.max(1200, tdee - 450);
  } else if (goal === "muscle_gain") {
    tdee += 350;
  }

  // Macro splits
  let proteinRatio = 0.25;
  let carbsRatio = 0.50;
  let fatRatio = 0.25;

  if (dietPreference === "keto") {
    proteinRatio = 0.25;
    carbsRatio = 0.05;
    fatRatio = 0.70;
  } else if (goal === "muscle_gain") {
    proteinRatio = 0.30;
    carbsRatio = 0.45;
    fatRatio = 0.25;
  } else if (goal === "weight_loss") {
    proteinRatio = 0.35;
    carbsRatio = 0.35;
    fatRatio = 0.30;
  }

  const dailyCalories = Math.round(tdee);
  const proteinGrams = Math.round((dailyCalories * proteinRatio) / 4);
  const carbsGrams = Math.round((dailyCalories * carbsRatio) / 4);
  const fatGrams = Math.round((dailyCalories * fatRatio) / 9);

  // Hydration: ~35ml/kg
  const waterTargetMl = Math.max(2000, Math.round(safeWeight * 35));

  return {
    dailyCalorieTarget: dailyCalories,
    proteinTarget: proteinGrams,
    carbsTarget: carbsGrams,
    fatTarget: fatGrams,
    waterTargetMl,
  };
}
