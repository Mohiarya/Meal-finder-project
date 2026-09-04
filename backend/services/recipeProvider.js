// Hybrid recipe search: local SQLite catalog first, an external recipe
// API (Spoonacular) only when the local catalog can't cover a request.
//
// The one rule everything here exists to enforce: matchesHardConstraints()
// from recommendationEngine.js is the ONLY thing allowed to decide
// whether a recipe is safe/eligible, for local AND external recipes
// alike. An external recipe is normalized into the exact same shape a
// local Prisma meal has (dietaryTags/instructions as JSON strings,
// ingredients as [{ingredient:{name}}]) specifically so the rest of the
// recommendation engine — filtering, ranking, formatting — never needs
// to know or care where a recipe came from.
import { getRecipeApiKey, SPOONACULAR_BASE } from "../config/recipeApi.js";
import { matchesHardConstraints, filterWithFallback } from "./recommendationEngine.js";

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour — the maximum Spoonacular's terms permit caching for.
const cache = new Map();

// A rough, conservative points budget guard for the free tier (50
// points/day). This is a shared, global counter — not per-user — because
// the quota belongs to the one API key the whole app shares, not to any
// individual request. Deliberately stays well under the real limit so a
// burst of searches degrades to "local only" instead of the key getting
// hard-blocked (402) for the rest of the day.
const DAILY_POINT_BUDGET = 35;
const POINTS_PER_CALL_ESTIMATE = 3; // 1 base + ~0.01/result*8 + 1 nutrient-filter surcharge, rounded up
let pointsUsedToday = 0;
let budgetResetAt = nextMidnightUTC();

function nextMidnightUTC() {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
}

function hasExternalBudget() {
  if (Date.now() >= budgetResetAt) {
    pointsUsedToday = 0;
    budgetResetAt = nextMidnightUTC();
  }
  return pointsUsedToday + POINTS_PER_CALL_ESTIMATE <= DAILY_POINT_BUDGET;
}

function spendExternalBudget() {
  pointsUsedToday += POINTS_PER_CALL_ESTIMATE;
}

function cacheGet(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return hit.data;
}

function cacheSet(key, data) {
  cache.set(key, { timestamp: Date.now(), data });
}

// A request has "signal" when it named a real, checkable constraint
// (calories, protein, diet, cuisine, slot, prep time). A prompt like
// "cake recipe" or "chicken biryani" has none of these — every local
// recipe trivially satisfies an empty constraint set, which is exactly
// how the app used to confidently return an unrelated steak dinner for
// "cake recipe". Distinguishing the two cases is what fixes that.
export function hasAnyConstraintSignal(constraints) {
  return Boolean(
    constraints?.requestedSlot ||
      constraints?.maxCalories ||
      constraints?.minProtein ||
      constraints?.diet ||
      constraints?.requestedCuisine ||
      constraints?.maxTimeMinutes
  );
}

const STOP_WORDS = new Set([
  "recipe", "recipes", "meal", "meals", "food", "dish", "dishes", "give", "me", "a", "an",
  "the", "please", "some", "for", "of", "with", "and", "i", "want", "need", "get", "find",
  "show", "make", "cook", "something", "any", "good",
]);

function significantWords(text) {
  return (text || "")
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
}

// A deliberately crude text-relevance check — the local catalog has no
// real search index, so this exists only to answer "does this dish name
// plausibly appear anywhere in our 110 recipes" without pretending to be
// a real search engine (that's what the external API is for).
export function textLooselyMatches(rawQuery, meal) {
  const words = significantWords(rawQuery);
  if (words.length === 0) return false;
  const ingredientNames = (meal.ingredients || []).map((i) => i.ingredient?.name || i.name || "").join(" ");
  const haystack = `${meal.title} ${meal.description} ${meal.cuisine} ${ingredientNames}`.toLowerCase();
  // Word-boundary match, not a bare substring check — "cake" must not
  // match "pancakes", exactly the false positive that let "cake recipe"
  // silently resolve to a pancake dish instead of an honest no-match.
  return words.some((w) => new RegExp(`\\b${w}\\b`).test(haystack));
}

function dedupeByTitle(meals) {
  const seen = new Set();
  const out = [];
  for (const m of meals) {
    const key = m.title.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(m);
  }
  return out;
}

const DIET_MAP = { vegan: "vegan", vegetarian: "vegetarian", pescatarian: "pescetarian", keto: "ketogenic" };
const INTOLERANCE_MAP = {
  peanut: "Peanut", peanuts: "Peanut", "tree nut": "Tree Nut", "tree nuts": "Tree Nut",
  dairy: "Dairy", milk: "Dairy", egg: "Egg", eggs: "Egg", gluten: "Gluten", wheat: "Wheat",
  soy: "Soy", sesame: "Sesame", shellfish: "Shellfish", seafood: "Seafood", sulfite: "Sulfite", grain: "Grain",
};

function detectExternalType(rawQuery, constraints) {
  const lower = (rawQuery || "").toLowerCase();
  if (/\bcake\b|\bdessert\b|\bcookie\b|\bpie\b|\bsweet\b|\bchocolate\b|\bice cream\b/.test(lower)) return "dessert";
  if (constraints?.requestedSlot === "breakfast") return "breakfast";
  if (constraints?.requestedSlot === "snack") return "snack";
  if (constraints?.requestedSlot === "dinner" || constraints?.requestedSlot === "lunch") return "main course";
  return null;
}

/**
 * Calls Spoonacular's complex recipe search. Returns { results, reason }
 * — reason is set (and results always []) whenever nothing was actually
 * fetched, so the caller can decide honestly whether to fall back rather
 * than silently treating "API skipped" the same as "API returned zero".
 */
export async function searchExternalRecipes({ rawQuery = "", constraints = {}, number = 8, timeoutMs = 6000 } = {}) {
  const apiKey = getRecipeApiKey();
  if (!apiKey) return { results: [], reason: "no_api_key" };
  if (!hasExternalBudget()) return { results: [], reason: "quota_exceeded" };

  const params = new URLSearchParams({
    apiKey,
    number: String(number),
    addRecipeNutrition: "true",
    addRecipeInformation: "true",
    fillIngredients: "true",
    instructionsRequired: "false",
    sort: "meta-score",
  });

  if (rawQuery && rawQuery.trim()) params.set("query", rawQuery.trim());
  if (constraints.requestedCuisine) params.set("cuisine", constraints.requestedCuisine);
  if (constraints.diet && DIET_MAP[constraints.diet]) params.set("diet", DIET_MAP[constraints.diet]);
  if (constraints.maxCalories) params.set("maxCalories", String(constraints.maxCalories));
  if (constraints.minProtein) params.set("minProtein", String(constraints.minProtein));
  if (constraints.maxTimeMinutes) params.set("maxReadyTime", String(constraints.maxTimeMinutes));

  const type = detectExternalType(rawQuery, constraints);
  if (type) params.set("type", type);

  const intolerances = [...new Set((constraints.excludedTerms || []).map((t) => INTOLERANCE_MAP[t]).filter(Boolean))];
  if (intolerances.length) params.set("intolerances", intolerances.join(","));

  const cacheKey = params.toString().replace(/apiKey=[^&]+&?/, "");
  const cached = cacheGet(cacheKey);
  if (cached) return { results: cached, reason: null };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    spendExternalBudget();
    const response = await fetch(`${SPOONACULAR_BASE}/complexSearch?${params.toString()}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`Spoonacular search failed: HTTP ${response.status}`);
      return { results: [], reason: response.status === 402 ? "quota_exceeded" : "api_error" };
    }

    const data = await response.json();
    const results = Array.isArray(data.results) ? data.results : [];
    cacheSet(cacheKey, results);
    return { results, reason: null };
  } catch (error) {
    clearTimeout(timeout);
    const reason = error.name === "AbortError" ? "timeout" : "api_error";
    console.warn(`Spoonacular search error (${reason}):`, error.message);
    return { results: [], reason };
  }
}

function findNutrient(nutrients, name) {
  const hit = (nutrients || []).find((n) => n.name?.toLowerCase() === name.toLowerCase());
  const value = hit ? Number(hit.amount) : NaN;
  return Number.isFinite(value) ? value : null;
}

function mapDishTypesToMealType(dishTypes = []) {
  const types = dishTypes.map((t) => t.toLowerCase());
  if (types.includes("breakfast") || types.includes("brunch")) return "breakfast";
  if (types.includes("dessert") || types.includes("snack") || types.includes("fingerfood")) return "snack";
  if (types.includes("lunch")) return "lunch";
  if (types.includes("main course") || types.includes("dinner") || types.includes("soup")) return "dinner";
  return "lunch";
}

function stripHtml(html) {
  return (html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Maps one raw Spoonacular result into the exact shape a raw Prisma meal
 * (with its `ingredients: [{ingredient, amount, unit}]` include) has —
 * dietaryTags/instructions as JSON strings included — so
 * matchesHardConstraints/filterWithFallback/rankBy.../formatMeal all work
 * completely unmodified regardless of source. Returns null only when the
 * result is missing the bare minimum to be a recipe at all (title/id).
 */
export function normalizeExternalRecipe(raw) {
  if (!raw || !raw.id || !raw.title) return null;

  const nutrients = raw.nutrition?.nutrients || [];
  const calories = findNutrient(nutrients, "Calories");
  const protein = findNutrient(nutrients, "Protein");
  const carbs = findNutrient(nutrients, "Carbohydrates");
  const fat = findNutrient(nutrients, "Fat");

  const tags = [];
  if (raw.vegan) tags.push("Vegan", "Vegetarian");
  else if (raw.vegetarian) tags.push("Vegetarian");
  if (raw.glutenFree) tags.push("Gluten-Free");
  if (raw.dairyFree) tags.push("Dairy-Free");
  if (Array.isArray(raw.diets) && raw.diets.includes("ketogenic")) tags.push("Keto");

  const steps = raw.analyzedInstructions?.[0]?.steps?.map((s) => s.step).filter(Boolean) || [];
  const instructions = steps.length ? steps : stripHtml(raw.instructions) ? [stripHtml(raw.instructions)] : [];

  const ingredients = (raw.extendedIngredients || []).map((i) => ({
    ingredient: { name: i.nameClean || i.name || i.original || "ingredient", category: "Pantry" },
    amount: typeof i.amount === "number" ? i.amount : 0,
    unit: i.unit || "",
  }));

  return {
    id: `ext-spoonacular-${raw.id}`,
    title: raw.title,
    description: stripHtml(raw.summary).slice(0, 220) || `${raw.title} — via Spoonacular.`,
    imageUrl: raw.image || null,
    calories,
    protein,
    carbs,
    fat,
    prepTimeMinutes: typeof raw.preparationMinutes === "number" && raw.preparationMinutes >= 0 ? raw.preparationMinutes : Math.round((raw.readyInMinutes || 30) / 2),
    cookTimeMinutes: typeof raw.cookingMinutes === "number" && raw.cookingMinutes >= 0 ? raw.cookingMinutes : Math.round((raw.readyInMinutes || 30) / 2),
    cuisine: raw.cuisines?.[0] || "International",
    mealType: mapDishTypesToMealType(raw.dishTypes),
    dietaryTags: JSON.stringify(tags),
    instructions: JSON.stringify(instructions),
    ingredients,
    servings: raw.servings || 1,
    source: "spoonacular",
    sourceUrl: raw.sourceUrl || `https://spoonacular.com/recipes/${(raw.title || "").replace(/\s+/g, "-")}-${raw.id}`,
    sourceName: raw.sourceName || "the original recipe site",
  };
}

/**
 * Nutrition safety gate. A recipe can name real ingredients and still be
 * unusable for a hard calorie/protein constraint if the provider simply
 * didn't return nutrition for it — this must never be silently treated
 * as "0 kcal" or "satisfies the limit". title/imageUrl are required for
 * a usable UI card; all four macros must be present, finite, non-negative
 * numbers, or the recipe is rejected outright rather than shown with a
 * guessed or missing value.
 */
export function validateExternalRecipe(meal) {
  if (!meal || typeof meal !== "object") return false;
  if (!meal.title || !meal.title.trim()) return false;
  if (!meal.imageUrl) return false;
  for (const field of ["calories", "protein", "carbs", "fat"]) {
    const v = meal[field];
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0) return false;
  }
  return true;
}

/**
 * `requireTextMatch` distinguishes the two callers' very different query
 * shapes. The AI Assistant passes a whole natural-language sentence as
 * both the query AND the source of any structured constraints ("under
 * 400 calories" IS the request) — there, an empty constraint set really
 * does mean "nothing specific was asked", so falling back to text
 * relevance only when there's zero structured signal is correct.
 *
 * The Meal Finder search box is different: it's always a dish-name/
 * keyword field, separate from its own calorie/cuisine/mealType filter
 * controls (which default to a value like maxCalories=800 whether or
 * not the user touched them). Treating that default as "real signal"
 * would let a calorie filter alone satisfy a search for "chicken
 * biryani" and match nearly the whole catalog — text relevance must
 * always apply whenever there's a search term here, on top of whatever
 * filters are also set, not instead of them.
 */
export function searchLocalRecipes(allMeals, constraints, rawQuery, { requireTextMatch = false } = {}) {
  const hasQuery = Boolean(rawQuery && rawQuery.trim());

  if (requireTextMatch && hasQuery) {
    return allMeals.filter((m) => matchesHardConstraints(m, constraints) && textLooselyMatches(rawQuery, m));
  }

  if (hasAnyConstraintSignal(constraints) || !hasQuery) {
    return allMeals.filter((m) => matchesHardConstraints(m, constraints));
  }
  // Pure dish-name lookup ("cake recipe", "chicken biryani") — an empty
  // constraint set matches every local recipe, which tells us nothing.
  // Text relevance against the query is the real filter here.
  return allMeals.filter((m) => matchesHardConstraints(m, constraints) && textLooselyMatches(rawQuery, m));
}

/**
 * The one hybrid entry point both /api/meals and /api/ai/assistant call.
 * Local catalog is always tried first; the external provider is only
 * ever queried when local coverage falls short of `minResults`, and its
 * results are put through the exact same hard-constraint gate as local
 * ones before they can appear at all — the caller (and the recommendation
 * engine downstream of it) never needs to know which source a given
 * result came from.
 */
// Test-only: node:test runs every file in one process, so the module-level
// cache and points budget above would otherwise leak between test cases
// (and between test files) with no way to reset them from outside. Not
// used anywhere outside recipeProvider.test.js.
export function __resetForTests() {
  cache.clear();
  pointsUsedToday = 0;
  budgetResetAt = nextMidnightUTC();
}

export async function searchRecipes({ rawQuery = "", constraints, allMeals, minResults = 4, requireTextMatch = false }) {
  const localCandidates = searchLocalRecipes(allMeals, constraints, rawQuery, { requireTextMatch });

  if (localCandidates.length >= minResults) {
    return { results: localCandidates, exactMatchFound: true, usedExternal: false, relaxedReason: null, noMatch: false };
  }

  const { results: rawExternal, reason: externalSkipReason } = await searchExternalRecipes({ rawQuery, constraints });
  const externalValid = rawExternal
    .map(normalizeExternalRecipe)
    .filter(Boolean)
    .filter(validateExternalRecipe)
    .filter((m) => matchesHardConstraints(m, constraints));

  const combined = dedupeByTitle([...localCandidates, ...externalValid]);
  if (combined.length > 0) {
    return {
      results: combined,
      exactMatchFound: localCandidates.length >= minResults,
      usedExternal: externalValid.length > 0,
      relaxedReason: externalValid.length > 0 ? "Supplemented with results from an external recipe provider — your dietary and calorie limits still apply to those too." : null,
      noMatch: false,
    };
  }

  // Relaxing calorie/cuisine/etc. constraints only makes sense when
  // there's no search term driving the request — for a dish-name search
  // (requireTextMatch) that simply isn't in the catalog, relaxing those
  // filters would just resurface irrelevant recipes again, exactly the
  // bug this whole hybrid path exists to avoid.
  const hasSignal = !requireTextMatch && hasAnyConstraintSignal(constraints);
  if (hasSignal) {
    const fallback = filterWithFallback(allMeals, constraints);
    if (fallback.candidates.length > 0) {
      return {
        results: fallback.candidates,
        exactMatchFound: false,
        usedExternal: externalValid.length > 0,
        relaxedReason: fallback.relaxedReason,
        noMatch: false,
      };
    }
  }

  return {
    results: [],
    exactMatchFound: false,
    usedExternal: Boolean(externalSkipReason === null),
    relaxedReason: null,
    noMatch: true,
    externalSkipReason,
  };
}
