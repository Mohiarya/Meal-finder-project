// Automated data-quality validation for the recipe dataset — run this
// any time recipes are added or edited (`npm run validate-recipes`).
// This does NOT verify nutrition against any external source (no such
// source is used) — it checks internal consistency: required fields
// present, dietary tags matching actual ingredients where checkable,
// image URLs actually resolving, and macro math roughly agreeing with
// stated calories. "Curated" is the accurate word for this data, not
// "verified" — nothing here is checked against an outside authority.
import { allSeedRecipes } from "../prisma/recipes/index.js";

const REQUIRED_FIELDS = ["title", "description", "imageUrl", "calories", "protein", "carbs", "fat", "cuisine", "mealType"];
const VALID_MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

let errors = [];
let warnings = [];

function report(list, label, items, fmt) {
  if (items.length === 0) return;
  console.log(`\n${label} (${items.length}):`);
  items.forEach((i) => console.log("  -", fmt(i)));
  list.push(...items);
}

// 1. Required fields present and sane
const missingFields = allSeedRecipes.filter((m) => REQUIRED_FIELDS.some((f) => m[f] === undefined || m[f] === null || m[f] === ""));
const invalidCalories = allSeedRecipes.filter((m) => !(m.calories > 0 && m.calories < 2000));
const invalidMealType = allSeedRecipes.filter((m) => !VALID_MEAL_TYPES.includes(m.mealType));
const noIngredients = allSeedRecipes.filter((m) => !m.ingredients || m.ingredients.length === 0);
const noInstructions = allSeedRecipes.filter((m) => !m.instructions || m.instructions.length === 0);
const badPrepTime = allSeedRecipes.filter((m) => !(m.prepTimeMinutes >= 0 && m.prepTimeMinutes <= 180));
const badServings = allSeedRecipes.filter((m) => !(m.servings >= 1 && m.servings <= 12));

report(errors, "Missing required fields", missingFields, (m) => m.title || "(untitled)");
report(errors, "Calories outside a sane range (0-2000)", invalidCalories, (m) => `${m.title}: ${m.calories}`);
report(errors, "Invalid mealType", invalidMealType, (m) => `${m.title}: "${m.mealType}"`);
report(errors, "No ingredients listed", noIngredients, (m) => m.title);
report(errors, "No instructions listed", noInstructions, (m) => m.title);
report(warnings, "Unusual prep time", badPrepTime, (m) => `${m.title}: ${m.prepTimeMinutes}min`);
report(warnings, "Unusual serving count", badServings, (m) => `${m.title}: ${m.servings}`);

// 2. Duplicate titles
const titleCounts = {};
allSeedRecipes.forEach((m) => (titleCounts[m.title] = (titleCounts[m.title] || 0) + 1));
const dupeTitles = Object.entries(titleCounts).filter(([, c]) => c > 1).map(([t]) => t);
report(errors, "Duplicate titles", dupeTitles, (t) => t);

// 3. Macro math sanity: stated calories vs protein*4+carbs*4+fat*9
const macroMismatch = allSeedRecipes
  .map((m) => ({ m, computed: m.protein * 4 + m.carbs * 4 + m.fat * 9 }))
  .filter(({ m, computed }) => Math.abs(computed - m.calories) / m.calories > 0.15)
  .map(({ m, computed }) => ({ title: m.title, stated: m.calories, computed: Math.round(computed) }));
report(warnings, "Macro math >15% off stated calories", macroMismatch, (x) => `${x.title}: stated ${x.stated}kcal vs computed ~${x.computed}kcal`);

// 4. Dietary tag sanity: a "Vegan" recipe shouldn't list obviously
// non-vegan ingredient keywords (best-effort text check, not authoritative)
const NON_VEGAN_HINTS = ["chicken", "beef", "pork", "fish", "shrimp", "salmon", "cod", "turkey", "egg", "cheese", "yogurt", "honey", "paneer", "milk", "butter"];
const veganTagMismatch = allSeedRecipes
  .filter((m) => (m.dietaryTags || []).includes("Vegan"))
  .filter((m) => (m.ingredients || []).some((i) => NON_VEGAN_HINTS.some((hint) => i.name.toLowerCase().includes(hint))));
report(warnings, "Tagged Vegan but lists a likely non-vegan ingredient", veganTagMismatch, (m) => m.title);

// 5. Image URLs — actually resolve them
console.log("\nChecking image URLs (this makes real network requests)...");
const brokenImages = [];
const queue = [...allSeedRecipes];
async function checkImages() {
  async function worker() {
    while (queue.length) {
      const m = queue.shift();
      try {
        const res = await fetch(m.imageUrl, { method: "HEAD" });
        if (!res.ok) brokenImages.push({ title: m.title, status: res.status });
      } catch {
        brokenImages.push({ title: m.title, status: "network error" });
      }
    }
  }
  await Promise.all(Array.from({ length: 12 }, worker));
}
await checkImages();
report(errors, "Broken image URLs", brokenImages, (b) => `${b.title}: ${b.status}`);

// 6. Shared images across recipes — not an error, but a real visual-variety gap worth surfacing
const byUrl = {};
allSeedRecipes.forEach((m) => {
  if (!byUrl[m.imageUrl]) byUrl[m.imageUrl] = [];
  byUrl[m.imageUrl].push(m.title);
});
const sharedGroups = Object.values(byUrl).filter((t) => t.length > 1);
const sharedCount = sharedGroups.reduce((s, g) => s + g.length, 0);
if (sharedCount > 0) {
  console.log(
    `\nKnown limitation: ${sharedCount}/${allSeedRecipes.length} recipes share a stock photo with at least one other recipe (${sharedGroups.length} groups, ${Object.keys(byUrl).length} unique images total). Not a bug — the images are real and load correctly — but it's real repetition a viewer will notice, not full per-recipe photography.`
  );
}

console.log(`\n${"=".repeat(60)}`);
console.log(`Total recipes: ${allSeedRecipes.length}`);
console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);
console.log("=".repeat(60));

if (errors.length > 0) {
  console.log("\n❌ Validation FAILED — fix the errors above.");
  process.exit(1);
} else {
  console.log("\n✅ No hard errors. Warnings above are worth a look but don't block seeding.");
}
