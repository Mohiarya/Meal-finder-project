import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  SlidersHorizontal,
  Flame,
  Dumbbell,
  Clock,
  Sparkles,
  UtensilsCrossed,
  X,
} from "lucide-react";
import api from "../api";
import MealCard from "../components/MealCard";
import MealModal from "../components/MealModal";
import MealSwapModal from "../components/MealSwapModal";

const MealFinderPage = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState("All");
  const [mealType, setMealType] = useState("All");
  const [dietaryTag, setDietaryTag] = useState("All");
  const [maxCalories, setMaxCalories] = useState(800);
  const [minProtein, setMinProtein] = useState(0);
  const [sortBy, setSortBy] = useState("relevance");
  const [visibleCount, setVisibleCount] = useState(18);
  const [showFilters, setShowFilters] = useState(false);

  const [activeMeal, setActiveMeal] = useState(null);
  const [swapState, setSwapState] = useState(null);
  const [notification, setNotification] = useState(null);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const res = await api.getMeals({
        search,
        cuisine: cuisine === "All" ? undefined : cuisine,
        mealType: mealType === "All" ? undefined : mealType,
        dietaryTag: dietaryTag === "All" ? undefined : dietaryTag,
        maxCalories,
        minProtein: minProtein > 0 ? minProtein : undefined,
        sortBy: sortBy === "relevance" ? undefined : sortBy,
      });
      setMeals(res.meals || []);
      setVisibleCount(18);
    } catch (err) {
      console.error("Failed to load meals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMeals();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, cuisine, mealType, dietaryTag, maxCalories, minProtein, sortBy]);

  const handleQuickPlan = async (meal, day, slot) => {
    try {
      await api.planMeal({
        mealId: meal.id,
        dayOfWeek: day,
        slot,
        servings: 1,
      });
      setNotification(`Added "${meal.title}" to ${day.toUpperCase()} ${slot}!`);
      setTimeout(() => setNotification(null), 3500);
    } catch (err) {
      console.error("Failed to plan meal:", err);
    }
  };

  const cuisines = [
    "All",
    "Indian",
    "Mediterranean",
    "Italian",
    "Mexican",
    "American",
    "Asian",
    "Japanese",
    "Korean",
    "Thai",
    "Middle Eastern",
  ];
  const mealTypes = ["All", "Breakfast", "Lunch", "Dinner", "Snack"];
  const dietaryTags = ["All", "Vegetarian", "Vegan", "High-Protein", "Keto", "Low-Calorie", "Gluten-Free"];

  const resetFilters = () => {
    setSearch("");
    setCuisine("All");
    setMealType("All");
    setDietaryTag("All");
    setMaxCalories(800);
    setMinProtein(0);
    setSortBy("relevance");
    setVisibleCount(18);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-zinc-950 px-4 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-5 h-5" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <UtensilsCrossed className="w-7 h-7 text-emerald-400" />
            <span>Discover Gourmet Nutrition</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Explore curated meals with calculated calories, protein, and micro-nutrients.
          </p>
        </div>

        {/* Filter toggle on mobile */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm font-semibold"
        >
          <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
          <span>{showFilters ? "Hide Filters" : "Filter & Refine"}</span>
        </button>
      </div>

      {/* Search Bar & Primary Controls */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by recipe name, ingredients (e.g. salmon, quinoa, tofu), or cuisine..."
            className="w-full pl-12 pr-10 py-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Meal Type Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-zinc-400 mr-2 uppercase tracking-wider">
            Meal Slot:
          </span>
          {mealTypes.map((type) => (
            <button
              key={type}
              onClick={() => setMealType(type)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                mealType === type
                  ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20"
                  : "bg-zinc-950 text-zinc-300 hover:bg-zinc-800 border border-zinc-800"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Advanced Filters Drawer / Section */}
        <div className={`pt-4 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 ${showFilters ? "block" : "hidden md:grid"}`}>
          {/* Cuisine Select */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Cuisine</label>
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
            >
              {cuisines.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Dietary Tag Select */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Dietary Preference</label>
            <select
              value={dietaryTag}
              onChange={(e) => setDietaryTag(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
            >
              {dietaryTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Select */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Sort Recipes</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="relevance">Lowest Calories (Default)</option>
              <option value="calories_desc">Highest Calories</option>
              <option value="protein_desc">Highest Protein Density</option>
              <option value="prep_asc">Fastest Preparation</option>
            </select>
          </div>

          {/* Max Calories Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-zinc-300 mb-1.5">
              <span>Max Calories</span>
              <span className="text-orange-400 font-bold">{maxCalories} kcal</span>
            </div>
            <input
              type="range"
              min="200"
              max="900"
              step="25"
              value={maxCalories}
              onChange={(e) => setMaxCalories(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-zinc-950 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Min Protein Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-zinc-300 mb-1.5">
              <span>Min Protein</span>
              <span className="text-indigo-400 font-bold">{minProtein}g</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={minProtein}
              onChange={(e) => setMinProtein(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-zinc-950 h-2 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Results Meta */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-zinc-400 font-medium">
          Showing <span className="text-white font-bold">{Math.min(visibleCount, meals.length)}</span> of <span className="text-emerald-400 font-bold">{meals.length}</span> curated recipes
        </span>
        {(search || cuisine !== "All" || mealType !== "All" || dietaryTag !== "All" || maxCalories !== 800 || minProtein !== 0 || sortBy !== "relevance") && (
          <button
            onClick={resetFilters}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Meals Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl h-80 animate-pulse"
            />
          ))}
        </div>
      ) : meals.length === 0 ? (
        <div className="py-16 text-center bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-2xl mx-auto space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-zinc-400 mx-auto flex items-center justify-center">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No exact matches found</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
              Your active constraints{" "}
              <span className="text-emerald-400 font-semibold">
                {[
                  cuisine !== "All" && `Cuisine: ${cuisine}`,
                  mealType !== "All" && `Slot: ${mealType}`,
                  dietaryTag !== "All" && `Tag: ${dietaryTag}`,
                  maxCalories < 750 && `Max ${maxCalories} kcal`,
                  minProtein > 0 && `Min ${minProtein}g protein`,
                  search && `Search "${search}"`,
                ]
                  .filter(Boolean)
                  .join(" • ")}
              </span>{" "}
              returned 0 results.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {maxCalories < 850 && (
              <button
                onClick={() => setMaxCalories((prev) => Math.min(900, prev + 150))}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors border border-zinc-700"
              >
                + Increase Calorie Limit (+150 kcal)
              </button>
            )}

            {minProtein > 10 && (
              <button
                onClick={() => setMinProtein((prev) => Math.max(0, prev - 15))}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors border border-zinc-700"
              >
                - Lower Protein Requirement (-15g)
              </button>
            )}

            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meals.slice(0, visibleCount).map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onSelectMeal={(m) => setActiveMeal(m)}
                onPlanMeal={handleQuickPlan}
              />
            ))}
          </div>

          {/* Pagination / Load More */}
          {visibleCount < meals.length && (
            <div className="pt-6 pb-2 text-center">
              <button
                onClick={() => setVisibleCount((prev) => prev + 18)}
                className="px-6 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-bold text-xs border border-zinc-700 hover:border-emerald-500/50 shadow-lg transition-all"
              >
                Load More Recipes (Showing {visibleCount} of {meals.length})
              </button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {activeMeal && (
        <MealModal
          meal={activeMeal}
          onClose={() => setActiveMeal(null)}
          onOpenSwap={(m) => setSwapState({ baseMeal: m, plannedMealId: null })}
        />
      )}

      {swapState && (
        <MealSwapModal
          baseMeal={swapState.baseMeal}
          plannedMealId={swapState.plannedMealId}
          onClose={() => setSwapState(null)}
          onSwapCompleted={() => fetchMeals()}
        />
      )}
    </div>
  );
};

export default MealFinderPage;
