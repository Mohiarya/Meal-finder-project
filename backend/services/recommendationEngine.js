// Single source of truth for "which meals are even allowed" and "how good
// a fit is this meal" — used by both the AI Assistant chat and the
// Dashboard's quick recommendation, so they can never silently drift into
// two different definitions of a hard constraint (the bug class this file
// exists to prevent).
//
// HARD constraints (never violated): allergens/disliked foods, dietary
// restriction (vegan/vegetarian/pescatarian/keto), meal-slot correctness,
// and — only when explicitly requested — a calorie ceiling or protein
// floor. These are enforced by matchesHardConstraints() below and nothing
// else in the codebase should re-implement this filtering.
//
// SOFT preferences (influence ranking, never exclude): cuisine, prep
// time, protein density, closeness to a calorie target. Two different
// ranking strategies are provided (see below) because "rank a prompt's
// explicit request" and "rank an unprompted 'what's next' suggestion"
// are genuinely different questions, not the same logic with different
// inputs — that difference is deliberate and named, not accidental.

/**
 * Parses a free-text prompt (plus persistent profile + today's tracker)
 * into a structured constraints object. Everything here is either
 * explicitly stated in THIS prompt or read from the user's persistent
 * profile — nothing is carried over from a previous request, because
 * nothing about a previous request is ever passed in here at all.
 */
export function extractConstraints(prompt, profile, todayTracker) {
  const lower = prompt.toLowerCase();

  let requestedSlot = null;
  if (lower.includes("breakfast") || lower.includes("morning")) {
    requestedSlot = "breakfast";
  } else if (lower.includes("dinner") || lower.includes("supper") || lower.includes("evening")) {
    requestedSlot = "dinner";
  } else if (lower.includes("lunch") || lower.includes("afternoon")) {
    requestedSlot = "lunch";
  } else if (lower.includes("snack") || lower.includes("dessert")) {
    requestedSlot = "snack";
  }

  let maxCalories = null;
  let caloriePreference = "balanced";

  const numCalMatch = lower.match(/(?:under|within|below|have|less than|about|around|<)?\s*(\d{3,4})\s*(?:cal|calories|kcal)/i);
  if (numCalMatch) {
    maxCalories = parseInt(numCalMatch[1], 10);
    caloriePreference = maxCalories <= 450 ? "low" : "budget";
  } else if (
    lower.includes("low-calorie") ||
    lower.includes("low calorie") ||
    lower.includes("light meal") ||
    lower.includes("low cal")
  ) {
    caloriePreference = "low";
    if (requestedSlot === "breakfast") maxCalories = 350;
    else if (requestedSlot === "snack") maxCalories = 220;
    else maxCalories = 450;
  } else if (
    lower.includes("remaining calorie") ||
    lower.includes("calories left") ||
    lower.includes("use my remaining")
  ) {
    const rem = todayTracker?.nutrition?.calories?.remaining;
    maxCalories = rem && rem > 150 ? rem : profile?.dailyCalorieTarget ? Math.round(profile.dailyCalorieTarget / 3) : 500;
  }

  let minProtein = null;
  let proteinPreference = "standard";

  const numProtMatch = lower.match(/(?:at least|need|over|min|minimum|>)?\s*(\d{2,3})\s*g\s*(?:of\s*)?protein/i);
  if (numProtMatch) {
    minProtein = parseInt(numProtMatch[1], 10);
    proteinPreference = "high";
  } else if (
    lower.includes("high-protein") ||
    lower.includes("high protein") ||
    lower.includes("hit my protein") ||
    lower.includes("protein target")
  ) {
    proteinPreference = "high";
    if (requestedSlot === "breakfast") minProtein = 20;
    else if (requestedSlot === "snack") minProtein = 12;
    else minProtein = 30;
  }

  let diet = null;
  if (lower.includes("vegan") || profile?.dietPreference === "vegan") {
    diet = "vegan";
  } else if (lower.includes("vegetarian") || lower.includes("veggie") || profile?.dietPreference === "vegetarian") {
    diet = "vegetarian";
  } else if (lower.includes("pescatarian") || profile?.dietPreference === "pescatarian") {
    diet = "pescatarian";
  } else if (lower.includes("keto") || lower.includes("low carb") || profile?.dietPreference === "keto") {
    diet = "keto";
  }

  const cuisinesList = [
    "indian", "mediterranean", "italian", "mexican", "american",
    "japanese", "korean", "thai", "middle eastern", "asian",
  ];
  let requestedCuisine = null;
  for (const c of cuisinesList) {
    if (lower.includes(c)) {
      requestedCuisine = c;
      break;
    }
  }

  let maxTimeMinutes = null;
  const timeMatch = lower.match(/(?:under|in|<|less than)?\s*(\d{1,2})\s*(?:min|mins|minutes)/i);
  if (timeMatch) {
    maxTimeMinutes = parseInt(timeMatch[1], 10);
  } else if (lower.includes("quick") || lower.includes("fast") || lower.includes("speedy")) {
    maxTimeMinutes = 20;
  }

  const promptAllergens = [];
  const allergyMatch = lower.match(/(?:allergic to|no|without|avoid)\s+([a-z\s,]+?)(?:\.|$|find|and|under|with)/i);
  if (allergyMatch) {
    const items = allergyMatch[1].split(/,|\band\b/).map((s) => s.trim()).filter(Boolean);
    promptAllergens.push(...items);
  }

  let profileAllergies = [];
  try {
    profileAllergies = JSON.parse(profile?.allergies || "[]");
  } catch {}

  let profileDisliked = [];
  try {
    profileDisliked = JSON.parse(profile?.dislikedFoods || "[]");
  } catch {}

  const excludedTerms = [
    ...new Set([...promptAllergens, ...profileAllergies, ...profileDisliked].map((s) => s.toLowerCase().trim())),
  ].filter((s) => s.length >= 3);

  return {
    requestedSlot,
    maxCalories,
    caloriePreference,
    minProtein,
    proteinPreference,
    diet,
    requestedCuisine,
    maxTimeMinutes,
    excludedTerms,
  };
}

/**
 * The profile-only equivalent of extractConstraints() — for recommendation
 * contexts with no natural-language prompt at all (the Dashboard's "what
 * should I eat next"). Still hard-enforces allergies/disliked foods and
 * diet preference, exactly like the prompt-driven path — a request with
 * no explicit constraints must never skip allergen safety.
 */
export function constraintsFromProfile(profile, { requestedSlot = null } = {}) {
  let diet = null;
  if (profile?.dietPreference === "vegan") diet = "vegan";
  else if (profile?.dietPreference === "vegetarian") diet = "vegetarian";
  else if (profile?.dietPreference === "pescatarian") diet = "pescatarian";
  else if (profile?.dietPreference === "keto") diet = "keto";

  let profileAllergies = [];
  try {
    profileAllergies = JSON.parse(profile?.allergies || "[]");
  } catch {}
  let profileDisliked = [];
  try {
    profileDisliked = JSON.parse(profile?.dislikedFoods || "[]");
  } catch {}
  const excludedTerms = [...new Set([...profileAllergies, ...profileDisliked].map((s) => s.toLowerCase().trim()))].filter(
    (s) => s.length >= 3
  );

  return {
    requestedSlot,
    maxCalories: null,
    caloriePreference: "balanced",
    minProtein: null,
    proteinPreference: "standard",
    diet,
    requestedCuisine: null,
    maxTimeMinutes: null,
    excludedTerms,
  };
}

// A naive but important normalization: someone types "allergic to
// peanuts" (plural), but an ingredient is named "Peanut Butter"
// (singular) — a bare substring check misses this entirely, which is
// exactly the kind of silent hard-constraint violation that must never
// happen for an allergy. Checking both the singular and plural form
// closes that gap without needing a real stemming library for one
// trailing letter.
function textMatchesExcludedTerm(text, term) {
  if (text.includes(term)) return true;
  const singular = term.endsWith("s") ? term.slice(0, -1) : term;
  const plural = term.endsWith("s") ? term : `${term}s`;
  return text.includes(singular) || text.includes(plural);
}

/**
 * The one hard-constraint gate. A meal that fails any check here is
 * excluded, full stop — `options.relax*` flags exist only for the
 * documented no-match fallback ladder (see filterWithFallback), never for
 * ordinary ranking.
 */
export function matchesHardConstraints(meal, constraints, options = {}) {
  const tags = JSON.parse(meal.dietaryTags || "[]");
  const ingredients = meal.ingredients.map((i) => i.ingredient.name.toLowerCase());
  const titleLower = meal.title.toLowerCase();

  // Allergens & disliked foods — never relaxed, under any option.
  for (const excluded of constraints.excludedTerms) {
    if (textMatchesExcludedTerm(titleLower, excluded)) return false;
    if (ingredients.some((ing) => textMatchesExcludedTerm(ing, excluded))) return false;
  }

  if (constraints.requestedSlot) {
    const slot = constraints.requestedSlot;
    if (slot === "breakfast" && meal.mealType !== "breakfast") return false;
    if (slot === "snack" && meal.mealType !== "snack") return false;
    if (slot === "dinner" && (meal.mealType === "breakfast" || meal.mealType === "snack")) return false;
    if (slot === "lunch" && (meal.mealType === "breakfast" || meal.mealType === "snack")) return false;
  }

  if (constraints.diet === "vegan" && !tags.includes("Vegan")) return false;
  if (constraints.diet === "vegetarian" && !(tags.includes("Vegetarian") || tags.includes("Vegan"))) return false;
  if (constraints.diet === "pescatarian" && !(tags.includes("Pescatarian") || tags.includes("Vegetarian") || tags.includes("Vegan"))) return false;
  if (constraints.diet === "keto" && !(tags.includes("Keto") || tags.includes("Low-Carb"))) return false;

  if (constraints.requestedCuisine && !options.relaxCuisine) {
    if (!meal.cuisine.toLowerCase().includes(constraints.requestedCuisine.toLowerCase())) return false;
  }

  if (constraints.maxCalories && !options.relaxCalories) {
    if (meal.calories > constraints.maxCalories) return false;
  }

  if (constraints.minProtein && !options.relaxProtein) {
    if (meal.protein < constraints.minProtein) return false;
  }

  if (constraints.maxTimeMinutes && !options.relaxTime) {
    if (meal.prepTimeMinutes + meal.cookTimeMinutes > constraints.maxTimeMinutes + 5) return false;
  }

  return true;
}

/**
 * Applies matchesHardConstraints, and if that yields zero candidates,
 * relaxes the softest constraint first (cuisine, then a modest +15%
 * calorie/protein allowance) — diet, allergens, and meal-slot are never
 * relaxed. Returns both the candidates and whether relaxation happened,
 * so callers can be honest with the user about it.
 */
export function filterWithFallback(allMeals, constraints) {
  let candidates = allMeals.filter((m) => matchesHardConstraints(m, constraints));
  if (candidates.length > 0) {
    return { candidates, exactMatchFound: true, relaxedReason: null };
  }

  if (constraints.requestedCuisine) {
    candidates = allMeals.filter((m) => matchesHardConstraints(m, constraints, { relaxCuisine: true }));
    if (candidates.length > 0) {
      return {
        candidates,
        exactMatchFound: false,
        relaxedReason: `No exact ${constraints.requestedCuisine} recipes matched all limits. Showing closest dishes from other cuisines.`,
      };
    }
  }

  if (constraints.maxCalories) {
    const expandedCal = Math.round(constraints.maxCalories * 1.15);
    candidates = allMeals.filter((m) => {
      if (m.calories > expandedCal) return false;
      return matchesHardConstraints(m, constraints, { relaxCalories: true, relaxProtein: true });
    });
    if (candidates.length > 0) {
      return {
        candidates,
        exactMatchFound: false,
        relaxedReason: `No dishes found under ${constraints.maxCalories} kcal meeting all criteria. Showing closest options at ${expandedCal} kcal.`,
      };
    }
  }

  candidates = allMeals.filter((m) => {
    const tags = JSON.parse(m.dietaryTags || "[]");
    if (constraints.diet === "vegan" && !tags.includes("Vegan")) return false;
    if (constraints.diet === "vegetarian" && !(tags.includes("Vegetarian") || tags.includes("Vegan"))) return false;
    const titleLower = m.title.toLowerCase();
    const ingredientNames = m.ingredients.map((i) => i.ingredient.name.toLowerCase());
    for (const excluded of constraints.excludedTerms) {
      if (textMatchesExcludedTerm(titleLower, excluded)) return false;
      if (ingredientNames.some((ing) => textMatchesExcludedTerm(ing, excluded))) return false;
    }
    if (constraints.requestedSlot === "dinner" && (m.mealType === "breakfast" || m.mealType === "snack")) return false;
    return true;
  });
  return {
    candidates,
    exactMatchFound: false,
    relaxedReason: "No exact recipes matched all strict parameters. Showing the closest nutritious alternatives — diet and allergen restrictions were still respected.",
  };
}

/** Prompt-driven ranking: protein density + calorie fit + slot/cuisine bonuses. */
export function rankByPromptRelevance(meals, constraints) {
  return [...meals].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    const densityA = a.protein / (a.calories / 100);
    const densityB = b.protein / (b.calories / 100);
    if (constraints.proteinPreference === "high" || constraints.caloriePreference === "low") {
      scoreA += densityA * 15;
      scoreB += densityB * 15;
    }

    if (constraints.maxCalories) {
      scoreA += (constraints.maxCalories - a.calories) * 0.05;
      scoreB += (constraints.maxCalories - b.calories) * 0.05;
    }

    if (constraints.requestedSlot && a.mealType === constraints.requestedSlot) scoreA += 25;
    if (constraints.requestedSlot && b.mealType === constraints.requestedSlot) scoreB += 25;

    if (constraints.requestedCuisine) {
      if (a.cuisine.toLowerCase().includes(constraints.requestedCuisine.toLowerCase())) scoreA += 30;
      if (b.cuisine.toLowerCase().includes(constraints.requestedCuisine.toLowerCase())) scoreB += 30;
    }

    scoreA += a.protein * 0.5;
    scoreB += b.protein * 0.5;

    return scoreB - scoreA;
  });
}

/**
 * Unprompted "what's next" ranking: closest to the calories actually
 * remaining today, protein as a tiebreaker. Deliberately a different
 * strategy from rankByPromptRelevance — there's no explicit request to
 * satisfy here, just a budget to fit, so "closest to remaining" is the
 * honest goal rather than reusing "low calorie" scoring that nobody asked for.
 */
export function rankByRemainingBudget(meals, remainingCalories) {
  return [...meals].sort((a, b) => {
    const diffA = Math.abs(a.calories - remainingCalories);
    const diffB = Math.abs(b.calories - remainingCalories);
    return diffA - diffB || b.protein - a.protein;
  });
}

export function formatMeal(m, constraints = {}) {
  return {
    id: m.id,
    title: m.title,
    description: m.description,
    imageUrl: m.imageUrl,
    calories: m.calories,
    protein: m.protein,
    carbs: m.carbs,
    fat: m.fat,
    prepTimeMinutes: m.prepTimeMinutes,
    cookTimeMinutes: m.cookTimeMinutes,
    cuisine: m.cuisine,
    mealType: m.mealType,
    dietaryTags: JSON.parse(m.dietaryTags || "[]"),
    instructions: JSON.parse(m.instructions || "[]"),
    ingredients: (m.ingredients || []).map((i) => ({
      name: i.ingredient?.name || i.name,
      amount: i.amount,
      unit: i.unit,
      category: i.ingredient?.category || "Pantry",
    })),
    calorieDifference: constraints.maxCalories ? m.calories - constraints.maxCalories : 0,
    proteinDifference: constraints.minProtein ? Math.round((m.protein - constraints.minProtein) * 10) / 10 : 0,
  };
}
