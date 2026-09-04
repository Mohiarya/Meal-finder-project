// Unlike getJwtSecret(), a missing key here is NOT fatal — the app is
// fully functional on the local 110-recipe catalog alone. The external
// provider is a pure enhancement, so every caller must treat a null key
// as "skip external, local-only" rather than throwing.
export function getRecipeApiKey() {
  const key = process.env.RECIPE_API_KEY;
  if (!key || !key.trim()) return null;
  return key.trim();
}

export const SPOONACULAR_BASE = "https://api.spoonacular.com/recipes";
