import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  extractConstraints,
  constraintsFromProfile,
  matchesHardConstraints,
  filterWithFallback,
  rankByPromptRelevance,
  rankByRemainingBudget,
} from "./recommendationEngine.js";

// A small, hand-built meal set covering every constraint this file needs
// to test — deliberately NOT the real 110-recipe dataset, so these tests
// don't depend on it changing.
function meal(overrides) {
  return {
    id: overrides.title,
    title: overrides.title,
    calories: 400,
    protein: 20,
    carbs: 40,
    fat: 15,
    prepTimeMinutes: 10,
    cookTimeMinutes: 10,
    cuisine: "American",
    mealType: "dinner",
    dietaryTags: "[]",
    ingredients: [],
    ...overrides,
  };
}

const STEAK = meal({ title: "Ribeye Steak", calories: 580, protein: 48, cuisine: "American", mealType: "dinner" });
const CHICKEN_WRAP = meal({
  title: "Buffalo Chicken Lettuce Wraps",
  calories: 320,
  protein: 44,
  mealType: "dinner",
  dietaryTags: JSON.stringify(["High-Protein", "Gluten-Free"]),
});
const VEGGIE_BOWL = meal({
  title: "Vegan Buddha Bowl",
  calories: 450,
  protein: 18,
  mealType: "dinner",
  dietaryTags: JSON.stringify(["Vegan", "Vegetarian"]),
});
const PEANUT_SATAY = meal({
  title: "Peanut Chicken Satay",
  calories: 400,
  protein: 30,
  mealType: "dinner",
  ingredients: [{ ingredient: { name: "Peanut Butter" } }],
});
const OATS = meal({
  title: "Overnight Oats",
  calories: 300,
  protein: 15,
  mealType: "breakfast",
  dietaryTags: JSON.stringify(["Vegetarian"]),
});
const ITALIAN_PASTA = meal({ title: "Italian Penne", calories: 500, protein: 20, cuisine: "Italian", mealType: "dinner" });

const ALL_MEALS = [STEAK, CHICKEN_WRAP, VEGGIE_BOWL, PEANUT_SATAY, OATS, ITALIAN_PASTA];

describe("extractConstraints — natural language parsing", () => {
  test('"under 450 calories" sets a hard ceiling', () => {
    const c = extractConstraints("dinner under 450 calories", null, null);
    assert.equal(c.maxCalories, 450);
  });

  test('"at least 30g protein" sets a hard floor', () => {
    const c = extractConstraints("I need at least 30g protein", null, null);
    assert.equal(c.minProtein, 30);
  });

  test('"low calorie" without a number applies a sensible default ceiling', () => {
    const c = extractConstraints("I want a low-calorie high-protein meal", null, null);
    assert.equal(c.caloriePreference, "low");
    assert.ok(c.maxCalories && c.maxCalories <= 450);
    assert.equal(c.proteinPreference, "high");
  });

  test('"high protein" sets protein preference and a floor', () => {
    const c = extractConstraints("give me a high-protein dinner", null, null);
    assert.equal(c.proteinPreference, "high");
    assert.ok(c.minProtein >= 30);
  });

  test('"vegetarian" sets diet', () => {
    assert.equal(extractConstraints("a vegetarian dinner", null, null).diet, "vegetarian");
  });

  test('"vegan" sets diet', () => {
    assert.equal(extractConstraints("vegan breakfast please", null, null).diet, "vegan");
  });

  test('"breakfast" / "dinner" set the requested slot', () => {
    assert.equal(extractConstraints("quick vegetarian breakfast", null, null).requestedSlot, "breakfast");
    assert.equal(extractConstraints("vegan dinner under 500 calories", null, null).requestedSlot, "dinner");
  });

  test("cuisine words are detected", () => {
    assert.equal(extractConstraints("Indian low-calorie lunch", null, null).requestedCuisine, "indian");
  });

  test("prep time constraints are detected", () => {
    assert.equal(extractConstraints("something ready in 15 minutes", null, null).maxTimeMinutes, 15);
    assert.equal(extractConstraints("a quick breakfast", null, null).maxTimeMinutes, 20);
  });

  test('"allergic to peanuts" is captured as an excluded term', () => {
    const c = extractConstraints("I'm allergic to peanuts, find me dinner", null, null);
    assert.ok(c.excludedTerms.includes("peanuts"));
  });

  test("profile-level allergies and disliked foods are always included, even with no prompt mention", () => {
    const profile = { allergies: JSON.stringify(["shellfish"]), dislikedFoods: JSON.stringify(["mushrooms"]) };
    const c = extractConstraints("just give me dinner", profile, null);
    assert.ok(c.excludedTerms.includes("shellfish"));
    assert.ok(c.excludedTerms.includes("mushrooms"));
  });
});

describe("Request isolation — no state leaks between calls", () => {
  test('"Italian breakfast" then "vegan dinner" — the second call has zero trace of the first', () => {
    const first = extractConstraints("Italian breakfast", null, null);
    assert.equal(first.requestedCuisine, "italian");
    assert.equal(first.requestedSlot, "breakfast");

    // A brand new call, same as a fresh HTTP request would produce —
    // nothing from `first` is threaded through here.
    const second = extractConstraints("vegan dinner under 500 calories", null, null);
    assert.equal(second.requestedCuisine, null, "must not inherit Italian from the previous request");
    assert.equal(second.requestedSlot, "dinner", "must not inherit breakfast from the previous request");
    assert.equal(second.diet, "vegan");
    assert.equal(second.maxCalories, 500);
  });

  test("persistent profile constraints (allergies) still apply across every call, unlike request-specific ones", () => {
    const profile = { allergies: JSON.stringify(["peanuts"]) };
    const first = extractConstraints("Italian breakfast", profile, null);
    const second = extractConstraints("vegan dinner", profile, null);
    assert.ok(first.excludedTerms.includes("peanuts"));
    assert.ok(second.excludedTerms.includes("peanuts"), "profile allergy must persist across requests");
    assert.equal(second.requestedCuisine, null);
  });
});

describe("matchesHardConstraints — rejection is the whole point", () => {
  test("580 kcal steak is rejected when the ceiling is 450 (the original bug)", () => {
    const constraints = { maxCalories: 450, excludedTerms: [] };
    assert.equal(matchesHardConstraints(STEAK, constraints), false);
  });

  test("320 kcal / 44g protein wrap passes the same ceiling", () => {
    const constraints = { maxCalories: 450, minProtein: 30, excludedTerms: [] };
    assert.equal(matchesHardConstraints(CHICKEN_WRAP, constraints), true);
  });

  test("non-vegan meal is rejected when vegan is required", () => {
    const constraints = { diet: "vegan", excludedTerms: [] };
    assert.equal(matchesHardConstraints(STEAK, constraints), false);
    assert.equal(matchesHardConstraints(VEGGIE_BOWL, constraints), true);
  });

  test("breakfast item is rejected when dinner is explicitly requested", () => {
    const constraints = { requestedSlot: "dinner", excludedTerms: [] };
    assert.equal(matchesHardConstraints(OATS, constraints), false);
  });

  test("dinner item is rejected when breakfast is explicitly requested", () => {
    const constraints = { requestedSlot: "breakfast", excludedTerms: [] };
    assert.equal(matchesHardConstraints(STEAK, constraints), false);
  });

  test("a peanut-containing recipe is rejected for a peanut allergy", () => {
    const constraints = { excludedTerms: ["peanuts"] };
    assert.equal(matchesHardConstraints(PEANUT_SATAY, constraints), false);
  });

  test("protein floor rejects a meal below it", () => {
    const constraints = { minProtein: 40, excludedTerms: [] };
    assert.equal(matchesHardConstraints(VEGGIE_BOWL, constraints), false); // 18g protein
    assert.equal(matchesHardConstraints(CHICKEN_WRAP, constraints), true); // 44g protein
  });
});

describe("filterWithFallback — never silently violates a hard constraint", () => {
  test("an impossible combination relaxes cuisine/calories, never diet or allergens", () => {
    const constraints = { diet: "vegan", excludedTerms: ["peanuts"], requestedCuisine: "italian", maxCalories: 100 };
    const { candidates, exactMatchFound } = filterWithFallback(ALL_MEALS, constraints);
    assert.equal(exactMatchFound, false);
    // Every fallback candidate must still be vegan and peanut-free —
    // that's the whole point of the fallback ladder.
    candidates.forEach((m) => {
      const tags = JSON.parse(m.dietaryTags || "[]");
      assert.ok(tags.includes("Vegan"), `${m.title} should still be vegan in the fallback set`);
    });
  });

  test("a satisfiable request returns exactMatchFound: true with no relaxation", () => {
    const constraints = { maxCalories: 450, minProtein: 30, excludedTerms: [] };
    const { exactMatchFound, relaxedReason } = filterWithFallback(ALL_MEALS, constraints);
    assert.equal(exactMatchFound, true);
    assert.equal(relaxedReason, null);
  });
});

describe("rankByPromptRelevance — protein density and calorie fit", () => {
  test("a lower-calorie, higher-protein-density meal outranks a higher-calorie one when both fit", () => {
    const constraints = { proteinPreference: "high", caloriePreference: "low", maxCalories: 600 };
    const ranked = rankByPromptRelevance([STEAK, CHICKEN_WRAP], constraints);
    // CHICKEN_WRAP: 44/3.2 ≈ 13.75 density; STEAK: 48/5.8 ≈ 8.3 density.
    assert.equal(ranked[0].title, CHICKEN_WRAP.title);
  });
});

describe("rankByRemainingBudget — closest-fit strategy for the unprompted dashboard suggestion", () => {
  test("picks the meal closest to remaining calories, protein as tiebreaker", () => {
    const ranked = rankByRemainingBudget([STEAK, CHICKEN_WRAP, ITALIAN_PASTA], 500);
    // ITALIAN_PASTA=500 (exact), STEAK=580 (80 off), CHICKEN_WRAP=320 (180 off)
    assert.equal(ranked[0].title, ITALIAN_PASTA.title);
  });
});

describe("constraintsFromProfile — the dashboard path still enforces allergens (previously it did not)", () => {
  test("a profile allergy excludes a peanut-containing meal even with no prompt at all", () => {
    const profile = { allergies: JSON.stringify(["peanuts"]), dietPreference: "omnivore" };
    const constraints = constraintsFromProfile(profile, { requestedSlot: "dinner" });
    assert.ok(constraints.excludedTerms.includes("peanuts"));
    assert.equal(matchesHardConstraints(PEANUT_SATAY, constraints), false);
  });

  test("a vegan profile preference is hard-enforced with no prompt at all", () => {
    const profile = { dietPreference: "vegan" };
    const constraints = constraintsFromProfile(profile, { requestedSlot: "dinner" });
    assert.equal(matchesHardConstraints(STEAK, constraints), false);
    assert.equal(matchesHardConstraints(VEGGIE_BOWL, constraints), true);
  });
});
