import { test, describe, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import {
  hasAnyConstraintSignal,
  textLooselyMatches,
  searchLocalRecipes,
  searchExternalRecipes,
  normalizeExternalRecipe,
  validateExternalRecipe,
  searchRecipes,
  __resetForTests,
} from "./recipeProvider.js";

// Small local fixture catalog — deliberately not the real 110 recipes,
// same reasoning as recommendationEngine.test.js: tests must not depend
// on seed data changing.
function meal(overrides) {
  return {
    id: overrides.id,
    title: overrides.title,
    description: overrides.description || "A test recipe.",
    cuisine: overrides.cuisine || "American",
    mealType: overrides.mealType || "lunch",
    calories: overrides.calories,
    protein: overrides.protein,
    carbs: overrides.carbs ?? 20,
    fat: overrides.fat ?? 10,
    prepTimeMinutes: overrides.prepTimeMinutes ?? 10,
    cookTimeMinutes: overrides.cookTimeMinutes ?? 10,
    dietaryTags: JSON.stringify(overrides.dietaryTags || []),
    instructions: JSON.stringify(overrides.instructions || ["Cook it."]),
    ingredients: (overrides.ingredients || []).map((name) => ({
      ingredient: { name },
      amount: 1,
      unit: "unit",
    })),
  };
}

const LOCAL_CATALOG = [
  meal({ id: "l1", title: "Grilled Chicken Bowl", calories: 400, protein: 35, ingredients: ["Chicken Breast", "Rice"] }),
  meal({ id: "l2", title: "Veggie Stir Fry", cuisine: "Asian", calories: 350, protein: 15, dietaryTags: ["Vegan", "Vegetarian"], ingredients: ["Tofu", "Broccoli"] }),
  meal({ id: "l3", title: "Beef Tacos", cuisine: "Mexican", calories: 550, protein: 28, ingredients: ["Beef", "Tortilla"] }),
];

function rawExternalHit(overrides = {}) {
  return {
    id: 99999,
    title: "External Test Salad",
    image: "https://img.example.com/99999.jpg",
    readyInMinutes: 20,
    servings: 2,
    sourceUrl: "https://example.com/recipe/99999",
    sourceName: "Example Recipe Site",
    summary: "<b>A fresh salad</b> with quinoa and veggies.",
    cuisines: ["Mediterranean"],
    dishTypes: ["lunch", "main course"],
    vegetarian: true,
    vegan: false,
    glutenFree: true,
    dairyFree: true,
    diets: ["gluten free"],
    extendedIngredients: [{ nameClean: "quinoa", amount: 1, unit: "cup" }, { nameClean: "cucumber", amount: 1, unit: "whole" }],
    analyzedInstructions: [{ steps: [{ step: "Cook quinoa." }, { step: "Toss with veggies." }] }],
    nutrition: {
      nutrients: [
        { name: "Calories", amount: 350, unit: "kcal" },
        { name: "Protein", amount: 18, unit: "g" },
        { name: "Fat", amount: 9, unit: "g" },
        { name: "Carbohydrates", amount: 45, unit: "g" },
      ],
    },
    ...overrides,
  };
}

function mockFetchOnce(impl) {
  mock.method(globalThis, "fetch", impl);
}

beforeEach(() => {
  __resetForTests();
  delete process.env.RECIPE_API_KEY;
});

afterEach(() => {
  mock.restoreAll();
  delete process.env.RECIPE_API_KEY;
});

describe("hasAnyConstraintSignal", () => {
  test("true when any real constraint is set", () => {
    assert.equal(hasAnyConstraintSignal({ maxCalories: 400 }), true);
    assert.equal(hasAnyConstraintSignal({ diet: "vegan" }), true);
    assert.equal(hasAnyConstraintSignal({ requestedCuisine: "indian" }), true);
  });

  test("false for an empty/no-signal constraint set — the 'cake recipe' case", () => {
    assert.equal(hasAnyConstraintSignal({ excludedTerms: ["peanut"] }), false);
    assert.equal(hasAnyConstraintSignal({}), false);
  });
});

describe("textLooselyMatches — local text relevance for dish-name-only queries", () => {
  test("matches a word appearing in the title", () => {
    assert.equal(textLooselyMatches("chicken bowl please", LOCAL_CATALOG[0]), true);
  });

  test("matches a word appearing only in an ingredient", () => {
    assert.equal(textLooselyMatches("something with tofu", LOCAL_CATALOG[1]), true);
  });

  test("does not match an unrelated dish name", () => {
    assert.equal(textLooselyMatches("chocolate cake", LOCAL_CATALOG[0]), false);
  });

  test("filler-only text with no real keyword matches nothing", () => {
    assert.equal(textLooselyMatches("give me a recipe please", LOCAL_CATALOG[0]), false);
  });

  test("a word must match a whole word, not a substring of a longer word — 'cake' must not match 'pancakes'", () => {
    const pancakes = meal({ id: "l4", title: "Blueberry Pancakes", calories: 380, protein: 32 });
    assert.equal(textLooselyMatches("cake recipe", pancakes), false);
  });
});

describe("searchLocalRecipes — requireTextMatch (Meal Finder's search box)", () => {
  test("a default filter value (e.g. a calorie ceiling the UI always sends) must not substitute for a real text match", () => {
    // Regression: the Meal Finder page always sends maxCalories, whether
    // or not the user touched that slider. Without requireTextMatch,
    // that alone counted as 'signal' and matched nearly the whole
    // catalog for a search like "chicken biryani" that isn't in it.
    const results = searchLocalRecipes(
      LOCAL_CATALOG,
      { maxCalories: 800, excludedTerms: [] },
      "sushi rolls", // no word overlap with any LOCAL_CATALOG entry
      { requireTextMatch: true }
    );
    assert.equal(results.length, 0);
  });

  test("with requireTextMatch, a real text match still combines with active filters (AND, not OR)", () => {
    const results = searchLocalRecipes(
      LOCAL_CATALOG,
      { maxCalories: 300, excludedTerms: [] }, // Grilled Chicken Bowl is 400 kcal — too high
      "chicken",
      { requireTextMatch: true }
    );
    assert.equal(results.length, 0);
  });
});

describe("searchLocalRecipes", () => {
  test("with real constraint signal, uses matchesHardConstraints (existing tested behavior)", () => {
    const results = searchLocalRecipes(LOCAL_CATALOG, { diet: "vegan", excludedTerms: [] }, "");
    assert.deepEqual(results.map((m) => m.id), ["l2"]);
  });

  test("with zero signal and a dish-name query, falls back to text relevance instead of matching everything", () => {
    const results = searchLocalRecipes(LOCAL_CATALOG, { excludedTerms: [] }, "beef tacos");
    assert.deepEqual(results.map((m) => m.id), ["l3"]);
  });

  test("with zero signal and no query at all, matches everything (profile-only / dashboard case)", () => {
    const results = searchLocalRecipes(LOCAL_CATALOG, { excludedTerms: [] }, "");
    assert.equal(results.length, LOCAL_CATALOG.length);
  });
});

describe("normalizeExternalRecipe", () => {
  test("maps a well-formed Spoonacular result into the local raw-meal shape", () => {
    const normalized = normalizeExternalRecipe(rawExternalHit());
    assert.equal(normalized.id, "ext-spoonacular-99999");
    assert.equal(normalized.title, "External Test Salad");
    assert.equal(normalized.calories, 350);
    assert.equal(normalized.protein, 18);
    assert.equal(normalized.carbs, 45);
    assert.equal(normalized.fat, 9);
    assert.equal(normalized.mealType, "lunch");
    assert.equal(normalized.cuisine, "Mediterranean");
    assert.equal(normalized.source, "spoonacular");
    assert.equal(normalized.sourceUrl, "https://example.com/recipe/99999");
    // dietaryTags/instructions must be JSON STRINGS, matching a raw
    // Prisma meal — this is what lets matchesHardConstraints/formatMeal
    // work unmodified on external recipes.
    assert.equal(typeof normalized.dietaryTags, "string");
    assert.deepEqual(JSON.parse(normalized.dietaryTags), ["Vegetarian", "Gluten-Free", "Dairy-Free"]);
    assert.equal(typeof normalized.instructions, "string");
    assert.deepEqual(JSON.parse(normalized.instructions), ["Cook quinoa.", "Toss with veggies."]);
    assert.equal(normalized.ingredients[0].ingredient.name, "quinoa");
  });

  test("returns null for a result missing even a title/id", () => {
    assert.equal(normalizeExternalRecipe({}), null);
    assert.equal(normalizeExternalRecipe(null), null);
  });

  test("missing nutrition data normalizes to null fields, not 0 or a guess", () => {
    const raw = rawExternalHit({ nutrition: { nutrients: [] } });
    const normalized = normalizeExternalRecipe(raw);
    assert.equal(normalized.calories, null);
    assert.equal(normalized.protein, null);
  });

  test("a recipe with no instructions at all normalizes to an empty instructions array, not fabricated steps", () => {
    const raw = rawExternalHit({ analyzedInstructions: [], instructions: "" });
    const normalized = normalizeExternalRecipe(raw);
    assert.deepEqual(JSON.parse(normalized.instructions), []);
  });
});

describe("validateExternalRecipe — the nutrition safety gate", () => {
  test("a well-formed normalized recipe passes", () => {
    assert.equal(validateExternalRecipe(normalizeExternalRecipe(rawExternalHit())), true);
  });

  test("missing nutrition data fails validation — never silently treated as satisfying a limit", () => {
    const raw = rawExternalHit({ nutrition: { nutrients: [] } });
    assert.equal(validateExternalRecipe(normalizeExternalRecipe(raw)), false);
  });

  test("partially missing nutrition (protein present, calories missing) still fails", () => {
    const raw = rawExternalHit({ nutrition: { nutrients: [{ name: "Protein", amount: 20, unit: "g" }] } });
    assert.equal(validateExternalRecipe(normalizeExternalRecipe(raw)), false);
  });

  test("missing image fails validation", () => {
    const raw = rawExternalHit({ image: null });
    assert.equal(validateExternalRecipe(normalizeExternalRecipe(raw)), false);
  });

  test("a negative or non-finite nutrient value fails validation", () => {
    const raw = rawExternalHit({ nutrition: { nutrients: [
      { name: "Calories", amount: -50, unit: "kcal" },
      { name: "Protein", amount: 18, unit: "g" },
      { name: "Fat", amount: 9, unit: "g" },
      { name: "Carbohydrates", amount: 45, unit: "g" },
    ] } });
    assert.equal(validateExternalRecipe(normalizeExternalRecipe(raw)), false);
  });
});

describe("searchExternalRecipes — provider call handling", () => {
  test("missing API key: skipped, not an error, no fetch call made", async () => {
    const fetchSpy = mock.fn();
    mockFetchOnce(fetchSpy);
    const { results, reason } = await searchExternalRecipes({ rawQuery: "biryani", constraints: { excludedTerms: [] } });
    assert.deepEqual(results, []);
    assert.equal(reason, "no_api_key");
    assert.equal(fetchSpy.mock.callCount(), 0);
  });

  test("API failure (500) returns empty results with a reason, does not throw", async () => {
    process.env.RECIPE_API_KEY = "test-key";
    mockFetchOnce(async () => ({ ok: false, status: 500 }));
    const { results, reason } = await searchExternalRecipes({ rawQuery: "pasta", constraints: { excludedTerms: [] } });
    assert.deepEqual(results, []);
    assert.equal(reason, "api_error");
  });

  test("quota/rate-limit response (402) is recognized distinctly", async () => {
    process.env.RECIPE_API_KEY = "test-key";
    mockFetchOnce(async () => ({ ok: false, status: 402 }));
    const { results, reason } = await searchExternalRecipes({ rawQuery: "pasta", constraints: { excludedTerms: [] } });
    assert.deepEqual(results, []);
    assert.equal(reason, "quota_exceeded");
  });

  test("a timeout (abort) is caught and reported, not thrown", async () => {
    process.env.RECIPE_API_KEY = "test-key";
    mockFetchOnce(async (url, opts) => {
      return new Promise((_, reject) => {
        opts.signal.addEventListener("abort", () => {
          const err = new Error("aborted");
          err.name = "AbortError";
          reject(err);
        });
      });
    });
    const { results, reason } = await searchExternalRecipes({ rawQuery: "slow query", constraints: { excludedTerms: [] }, timeoutMs: 50 });
    assert.deepEqual(results, []);
    assert.equal(reason, "timeout");
  });

  test("a successful call returns the raw results array", async () => {
    process.env.RECIPE_API_KEY = "test-key";
    mockFetchOnce(async () => ({
      ok: true,
      json: async () => ({ results: [rawExternalHit()] }),
    }));
    const { results, reason } = await searchExternalRecipes({ rawQuery: "salad", constraints: { excludedTerms: [] } });
    assert.equal(reason, null);
    assert.equal(results.length, 1);
    assert.equal(results[0].title, "External Test Salad");
  });

  test("the app's own internal daily points budget stops calls before the provider's own limit does", async () => {
    process.env.RECIPE_API_KEY = "test-key";
    let calls = 0;
    mockFetchOnce(async () => {
      calls += 1;
      return { ok: true, json: async () => ({ results: [] }) };
    });
    // Budget is 35, ~3 points/call estimate -> exhausted well before 20 calls.
    for (let i = 0; i < 20; i++) {
      await searchExternalRecipes({ rawQuery: `unique query ${i}`, constraints: { excludedTerms: [] } });
    }
    assert.ok(calls < 20, `expected the budget guard to cut off calls, but all 20 went through (calls=${calls})`);
  });
});

describe("searchRecipes — the hybrid orchestrator", () => {
  test("enough local results: returns local only, external is never called", async () => {
    const fetchSpy = mock.fn();
    mockFetchOnce(fetchSpy);
    const { results, usedExternal, exactMatchFound } = await searchRecipes({
      rawQuery: "",
      constraints: { excludedTerms: [] },
      allMeals: LOCAL_CATALOG,
      minResults: 2,
    });
    assert.equal(results.length, LOCAL_CATALOG.length);
    assert.equal(usedExternal, false);
    assert.equal(exactMatchFound, true);
    assert.equal(fetchSpy.mock.callCount(), 0);
  });

  test("insufficient local results falls through to the external provider", async () => {
    process.env.RECIPE_API_KEY = "test-key";
    mockFetchOnce(async () => ({ ok: true, json: async () => ({ results: [rawExternalHit()] }) }));
    const { results, usedExternal } = await searchRecipes({
      rawQuery: "salad",
      constraints: { excludedTerms: [] },
      allMeals: LOCAL_CATALOG, // none of these are "salad"-relevant by text match
      minResults: 5,
    });
    assert.equal(usedExternal, true);
    assert.ok(results.some((m) => m.title === "External Test Salad"));
  });

  test("an external candidate violating the calorie ceiling is excluded, not shown", async () => {
    process.env.RECIPE_API_KEY = "test-key";
    mockFetchOnce(async () => ({
      ok: true,
      json: async () => ({ results: [rawExternalHit({ nutrition: { nutrients: [
        { name: "Calories", amount: 900, unit: "kcal" },
        { name: "Protein", amount: 18, unit: "g" },
        { name: "Fat", amount: 9, unit: "g" },
        { name: "Carbohydrates", amount: 45, unit: "g" },
      ] } }) ] }),
    }));
    const { results } = await searchRecipes({
      rawQuery: "",
      constraints: { maxCalories: 400, excludedTerms: [] },
      allMeals: [], // force external path
      minResults: 3,
    });
    assert.equal(results.some((m) => m.title === "External Test Salad"), false);
  });

  test("an external candidate violating the protein floor is excluded, not shown", async () => {
    process.env.RECIPE_API_KEY = "test-key";
    mockFetchOnce(async () => ({
      ok: true,
      json: async () => ({ results: [rawExternalHit({ nutrition: { nutrients: [
        { name: "Calories", amount: 300, unit: "kcal" },
        { name: "Protein", amount: 5, unit: "g" },
        { name: "Fat", amount: 9, unit: "g" },
        { name: "Carbohydrates", amount: 45, unit: "g" },
      ] } }) ] }),
    }));
    const { results } = await searchRecipes({
      rawQuery: "",
      constraints: { minProtein: 30, excludedTerms: [] },
      allMeals: [],
      minResults: 3,
    });
    assert.equal(results.some((m) => m.title === "External Test Salad"), false);
  });

  test("vegetarian/vegan filtering applies identically to external results", async () => {
    process.env.RECIPE_API_KEY = "test-key";
    mockFetchOnce(async () => ({
      ok: true,
      json: async () => ({ results: [rawExternalHit({ vegetarian: false, vegan: false })] }),
    }));
    const { results } = await searchRecipes({
      rawQuery: "",
      constraints: { diet: "vegetarian", excludedTerms: [] },
      allMeals: [],
      minResults: 3,
    });
    assert.equal(results.length, 0);
  });

  test("allergy/excluded-term filtering applies to external ingredients", async () => {
    process.env.RECIPE_API_KEY = "test-key";
    mockFetchOnce(async () => ({
      ok: true,
      json: async () => ({ results: [rawExternalHit({
        extendedIngredients: [{ nameClean: "peanut butter", amount: 1, unit: "tbsp" }],
      })] }),
    }));
    const { results } = await searchRecipes({
      rawQuery: "",
      constraints: { excludedTerms: ["peanuts"], diet: null },
      allMeals: [],
      minResults: 3,
    });
    assert.equal(results.length, 0);
  });

  test("cuisine filtering applies to external results", async () => {
    process.env.RECIPE_API_KEY = "test-key";
    mockFetchOnce(async () => ({
      ok: true,
      json: async () => ({ results: [rawExternalHit({ cuisines: ["Italian"] })] }),
    }));
    const { results } = await searchRecipes({
      rawQuery: "",
      constraints: { requestedCuisine: "indian", excludedTerms: [] },
      allMeals: [],
      minResults: 3,
    });
    assert.equal(results.length, 0);
  });

  test("meal-type (slot) filtering applies to external results", async () => {
    process.env.RECIPE_API_KEY = "test-key";
    mockFetchOnce(async () => ({
      ok: true,
      json: async () => ({ results: [rawExternalHit({ dishTypes: ["dessert"] })] }), // -> mapped to 'snack'
    }));
    const { results } = await searchRecipes({
      rawQuery: "",
      constraints: { requestedSlot: "breakfast", excludedTerms: [] },
      allMeals: [],
      minResults: 3,
    });
    assert.equal(results.length, 0);
  });

  test("a local and an external recipe sharing a title are deduplicated", async () => {
    process.env.RECIPE_API_KEY = "test-key";
    mockFetchOnce(async () => ({
      ok: true,
      json: async () => ({ results: [rawExternalHit({ title: "Grilled Chicken Bowl" })] }),
    }));
    const { results } = await searchRecipes({
      rawQuery: "chicken",
      constraints: { excludedTerms: [] },
      allMeals: LOCAL_CATALOG, // already has "Grilled Chicken Bowl"
      minResults: 5,
    });
    const titles = results.map((m) => m.title.toLowerCase());
    const occurrences = titles.filter((t) => t === "grilled chicken bowl").length;
    assert.equal(occurrences, 1);
  });

  test("no match anywhere (local text-irrelevant, external unavailable) returns an honest noMatch — never a fabricated/unrelated recipe", async () => {
    // No RECIPE_API_KEY set -> external is skipped, not faked.
    const { results, noMatch } = await searchRecipes({
      rawQuery: "cake recipe",
      constraints: { excludedTerms: [] }, // zero signal, exactly the reported bug's prompt shape
      allMeals: LOCAL_CATALOG, // no cake-relevant local recipe
      minResults: 3,
    });
    assert.equal(noMatch, true);
    assert.deepEqual(results, []);
  });

  test("no match still returns nothing even when the external API is reachable but has nothing valid", async () => {
    process.env.RECIPE_API_KEY = "test-key";
    mockFetchOnce(async () => ({ ok: true, json: async () => ({ results: [] }) }));
    const { results, noMatch } = await searchRecipes({
      rawQuery: "an extremely specific nonexistent dish xyzabc",
      constraints: { excludedTerms: [] },
      allMeals: LOCAL_CATALOG,
      minResults: 3,
    });
    assert.equal(noMatch, true);
    assert.deepEqual(results, []);
  });

  test("a request WITH real constraint signal but no local/external match still uses the existing local relaxation ladder rather than a hard no-match", async () => {
    const { results, noMatch } = await searchRecipes({
      rawQuery: "",
      constraints: { requestedCuisine: "korean", maxCalories: 100, excludedTerms: [] }, // impossible combo
      allMeals: LOCAL_CATALOG,
      minResults: 5,
    });
    // filterWithFallback's relaxation ladder should still find *something*
    // from the 3-item local catalog rather than giving up outright.
    assert.equal(noMatch, false);
    assert.ok(results.length > 0);
  });
});
