import { indianMedItalianRecipes } from "./indian_med_italian.js";
import { mexicanAmericanMiddleEastRecipes } from "./mexican_american_middleeast.js";
import { asianJapaneseKoreanThaiRecipes } from "./asian_japanese_korean_thai.js";
import { expandedCollectionRecipes } from "./expanded_collection.js";
import { moreRecipes } from "./more_recipes.js";

// Combine all modules into a curated gourmet collection
export const allSeedRecipes = [
  ...indianMedItalianRecipes,
  ...mexicanAmericanMiddleEastRecipes,
  ...asianJapaneseKoreanThaiRecipes,
  ...expandedCollectionRecipes,
  ...moreRecipes,
];

export default allSeedRecipes;
