import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calculateNutritionTargets } from "./nutritionCalculator.js";

describe("calculateNutritionTargets — BMR (Mifflin-St Jeor)", () => {
  test("male: 10w + 6.25h - 5a + 5", () => {
    const { dailyCalorieTarget } = calculateNutritionTargets({
      age: 30, gender: "male", weight: 80, height: 180, activityLevel: "sedentary", goal: "maintenance",
    });
    // BMR = 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780
    // TDEE = 1780 * 1.2 (sedentary) = 2136
    assert.equal(dailyCalorieTarget, 2136);
  });

  test("female: 10w + 6.25h - 5a - 161", () => {
    const { dailyCalorieTarget } = calculateNutritionTargets({
      age: 30, gender: "female", weight: 60, height: 165, activityLevel: "sedentary", goal: "maintenance",
    });
    // BMR = 10*60 + 6.25*165 - 5*30 - 161 = 600 + 1031.25 - 150 - 161 = 1320.25
    // TDEE = 1320.25 * 1.2 = 1584.3 -> rounds to 1584
    assert.equal(dailyCalorieTarget, 1584);
  });
});

describe("calculateNutritionTargets — activity multipliers", () => {
  const base = { age: 25, gender: "male", weight: 70, height: 175, goal: "maintenance" };
  // BMR = 10*70 + 6.25*175 - 5*25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75

  test("sedentary uses 1.2x", () => {
    const { dailyCalorieTarget } = calculateNutritionTargets({ ...base, activityLevel: "sedentary" });
    assert.equal(dailyCalorieTarget, Math.round(1673.75 * 1.2));
  });

  test("very_active uses 1.9x, the highest multiplier", () => {
    const { dailyCalorieTarget } = calculateNutritionTargets({ ...base, activityLevel: "very_active" });
    assert.equal(dailyCalorieTarget, Math.round(1673.75 * 1.9));
  });

  test("an unrecognized activity level falls back to the moderate (1.55x) default rather than throwing", () => {
    const { dailyCalorieTarget } = calculateNutritionTargets({ ...base, activityLevel: "underwater_basket_weaving" });
    assert.equal(dailyCalorieTarget, Math.round(1673.75 * 1.55));
  });
});

describe("calculateNutritionTargets — goal adjustments", () => {
  const base = { age: 25, gender: "male", weight: 70, height: 175, activityLevel: "moderate" };
  // TDEE at moderate = round(1673.75 * 1.55) = 2594

  test("weight_loss subtracts a 450 kcal deficit", () => {
    const { dailyCalorieTarget } = calculateNutritionTargets({ ...base, goal: "weight_loss" });
    assert.equal(dailyCalorieTarget, 2594 - 450);
  });

  test("weight_loss never drops the target below the 1200 kcal safety floor", () => {
    // A small, low-activity body pushes the deficit under the floor.
    const { dailyCalorieTarget } = calculateNutritionTargets({
      age: 60, gender: "female", weight: 45, height: 150, activityLevel: "sedentary", goal: "weight_loss",
    });
    assert.ok(dailyCalorieTarget >= 1200, `expected >= 1200, got ${dailyCalorieTarget}`);
  });

  test("muscle_gain adds a 350 kcal surplus", () => {
    const { dailyCalorieTarget } = calculateNutritionTargets({ ...base, goal: "muscle_gain" });
    assert.equal(dailyCalorieTarget, 2594 + 350);
  });

  test("healthy_eating (or any other goal) applies no adjustment", () => {
    const { dailyCalorieTarget } = calculateNutritionTargets({ ...base, goal: "healthy_eating" });
    assert.equal(dailyCalorieTarget, 2594);
  });
});

describe("calculateNutritionTargets — macro ratios sum to the calorie target", () => {
  // 1g protein/carbs = 4 kcal, 1g fat = 9 kcal. Reconstructing calories
  // from the returned grams should land back near dailyCalorieTarget,
  // modulo the independent rounding of three separate values.
  function assertMacrosReconcile(result) {
    const reconstructed = result.proteinTarget * 4 + result.carbsTarget * 4 + result.fatTarget * 9;
    const diff = Math.abs(reconstructed - result.dailyCalorieTarget);
    assert.ok(diff <= 5, `macro grams (${reconstructed} kcal) drifted too far from target (${result.dailyCalorieTarget} kcal)`);
  }

  test("default (omnivore, healthy_eating) split is 25/50/25", () => {
    const result = calculateNutritionTargets({ age: 25, gender: "male", weight: 70, height: 175, activityLevel: "moderate", goal: "healthy_eating", dietPreference: "omnivore" });
    assertMacrosReconcile(result);
    assert.equal(result.proteinTarget, Math.round((result.dailyCalorieTarget * 0.25) / 4));
  });

  test("keto overrides the goal-based split to 25/5/70 regardless of goal", () => {
    const result = calculateNutritionTargets({ age: 25, gender: "male", weight: 70, height: 175, activityLevel: "moderate", goal: "muscle_gain", dietPreference: "keto" });
    assertMacrosReconcile(result);
    assert.equal(result.carbsTarget, Math.round((result.dailyCalorieTarget * 0.05) / 4));
    assert.equal(result.fatTarget, Math.round((result.dailyCalorieTarget * 0.70) / 9));
  });

  test("muscle_gain (non-keto) shifts to a higher-protein 30/45/25 split", () => {
    const result = calculateNutritionTargets({ age: 25, gender: "male", weight: 70, height: 175, activityLevel: "moderate", goal: "muscle_gain", dietPreference: "omnivore" });
    assertMacrosReconcile(result);
    assert.equal(result.proteinTarget, Math.round((result.dailyCalorieTarget * 0.30) / 4));
  });

  test("weight_loss shifts to a higher-protein 35/35/30 split", () => {
    const result = calculateNutritionTargets({ age: 25, gender: "male", weight: 70, height: 175, activityLevel: "moderate", goal: "weight_loss", dietPreference: "omnivore" });
    assertMacrosReconcile(result);
    assert.equal(result.proteinTarget, Math.round((result.dailyCalorieTarget * 0.35) / 4));
  });
});

describe("calculateNutritionTargets — hydration target", () => {
  test("scales at ~35ml per kg of body weight", () => {
    const { waterTargetMl } = calculateNutritionTargets({ age: 25, gender: "male", weight: 80, height: 175, activityLevel: "moderate", goal: "maintenance" });
    assert.equal(waterTargetMl, Math.round(80 * 35));
  });

  test("never drops below the 2000ml floor for a very light body weight", () => {
    const { waterTargetMl } = calculateNutritionTargets({ age: 25, gender: "female", weight: 40, height: 150, activityLevel: "sedentary", goal: "maintenance" });
    assert.ok(waterTargetMl >= 2000, `expected >= 2000, got ${waterTargetMl}`);
  });
});

describe("calculateNutritionTargets — input sanitization guards", () => {
  // The function silently substitutes safe defaults for physiologically
  // impossible inputs rather than propagating NaN/negative targets into
  // the rest of the app (e.g. a corrupted or partially-filled profile).

  test("a non-positive or implausibly low weight falls back to 70kg", () => {
    const withBadWeight = calculateNutritionTargets({ age: 25, gender: "male", weight: -5, height: 175, activityLevel: "sedentary", goal: "maintenance" });
    const withDefaultWeight = calculateNutritionTargets({ age: 25, gender: "male", weight: 70, height: 175, activityLevel: "sedentary", goal: "maintenance" });
    assert.equal(withBadWeight.dailyCalorieTarget, withDefaultWeight.dailyCalorieTarget);
  });

  test("an implausibly low height falls back to 175cm", () => {
    const withBadHeight = calculateNutritionTargets({ age: 25, gender: "male", weight: 70, height: 50, activityLevel: "sedentary", goal: "maintenance" });
    const withDefaultHeight = calculateNutritionTargets({ age: 25, gender: "male", weight: 70, height: 175, activityLevel: "sedentary", goal: "maintenance" });
    assert.equal(withBadHeight.dailyCalorieTarget, withDefaultHeight.dailyCalorieTarget);
  });

  test("an implausibly low age falls back to 25", () => {
    const withBadAge = calculateNutritionTargets({ age: 2, gender: "male", weight: 70, height: 175, activityLevel: "sedentary", goal: "maintenance" });
    const withDefaultAge = calculateNutritionTargets({ age: 25, gender: "male", weight: 70, height: 175, activityLevel: "sedentary", goal: "maintenance" });
    assert.equal(withBadAge.dailyCalorieTarget, withDefaultAge.dailyCalorieTarget);
  });

  test("no required field at all still returns a sane, fully-defaulted result", () => {
    const result = calculateNutritionTargets({});
    assert.ok(result.dailyCalorieTarget > 0);
    assert.ok(result.proteinTarget > 0);
    assert.ok(result.carbsTarget > 0);
    assert.ok(result.fatTarget > 0);
    assert.ok(result.waterTargetMl >= 2000);
  });
});
