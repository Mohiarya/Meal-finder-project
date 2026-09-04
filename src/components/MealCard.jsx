import React, { useState } from "react";
import { Heart, Clock, Flame, Dumbbell, Plus, Check } from "lucide-react";
import api from "../api";

const MealCard = ({ meal, onSelectMeal, onPlanMeal, onLogMeal, isFavoriteInitial = false }) => {
  const [isFavorite, setIsFavorite] = useState(isFavoriteInitial || meal.isFavorite || false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [showPlanMenu, setShowPlanMenu] = useState(false);
  const [plannedSuccess, setPlannedSuccess] = useState(false);

  const toggleFav = async (e) => {
    e.stopPropagation();
    try {
      setFavoriteLoading(true);
      const res = await api.toggleFavorite(meal.id);
      setIsFavorite(res.isFavorite);
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleQuickPlan = (e, day, slot) => {
    e.stopPropagation();
    if (onPlanMeal) {
      onPlanMeal(meal, day, slot);
      setPlannedSuccess(true);
      setShowPlanMenu(false);
      setTimeout(() => setPlannedSuccess(false), 2000);
    }
  };

  const days = [
    { label: "Mon", key: "mon" },
    { label: "Tue", key: "tue" },
    { label: "Wed", key: "wed" },
    { label: "Thu", key: "thu" },
    { label: "Fri", key: "fri" },
    { label: "Sat", key: "sat" },
    { label: "Sun", key: "sun" },
  ];

  return (
    <div
      onClick={() => onSelectMeal && onSelectMeal(meal)}
      className="group relative bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700/80 rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/20 cursor-pointer flex flex-col"
    >
      {/* Image container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-950">
        <img
          src={meal.imageUrl}
          alt={meal.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80";
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[80%]">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/20">
            {meal.cuisine}
          </span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-950/80 backdrop-blur-md text-zinc-300 border border-zinc-800">
            {meal.mealType?.charAt(0).toUpperCase() + meal.mealType?.slice(1)}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={toggleFav}
          disabled={favoriteLoading}
          aria-label="Toggle Favorite"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-zinc-950/80 backdrop-blur-md border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-red-400 transition-colors"
        >
          <Heart
            className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
          />
        </button>

        {/* Prep Time pill */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-medium text-zinc-300 bg-zinc-950/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-zinc-800">
          <Clock className="w-3 h-3 text-emerald-400" />
          <span>{meal.prepTimeMinutes + meal.cookTimeMinutes} mins</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-white text-base leading-snug line-clamp-1 group-hover:text-emerald-400 transition-colors">
          {meal.title}
        </h3>
        <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
          {meal.description}
        </p>

        {/* Dietary Tag Chips */}
        <div className="flex flex-wrap gap-1 mt-3">
          {(meal.dietaryTags || []).slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300 border border-zinc-700/40"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Nutrition Bar */}
        <div className="mt-4 pt-3 border-t border-zinc-800/60 grid grid-cols-4 gap-1 text-center">
          <div className="bg-zinc-950/60 rounded-lg py-1 px-1 border border-zinc-800/40">
            <span className="block text-[10px] text-zinc-400 font-medium">Calories</span>
            <span className="text-xs font-bold text-orange-400 flex items-center justify-center gap-0.5">
              <Flame className="w-2.5 h-2.5" />
              {meal.calories}
            </span>
          </div>
          <div className="bg-zinc-950/60 rounded-lg py-1 px-1 border border-zinc-800/40">
            <span className="block text-[10px] text-zinc-400 font-medium">Protein</span>
            <span className="text-xs font-bold text-indigo-400 flex items-center justify-center gap-0.5">
              <Dumbbell className="w-2.5 h-2.5" />
              {meal.protein}g
            </span>
          </div>
          <div className="bg-zinc-950/60 rounded-lg py-1 px-1 border border-zinc-800/40">
            <span className="block text-[10px] text-zinc-400 font-medium">Carbs</span>
            <span className="text-xs font-bold text-amber-400">{meal.carbs}g</span>
          </div>
          <div className="bg-zinc-950/60 rounded-lg py-1 px-1 border border-zinc-800/40">
            <span className="block text-[10px] text-zinc-400 font-medium">Fat</span>
            <span className="text-xs font-bold text-sky-400">{meal.fat}g</span>
          </div>
        </div>

        {/* Card Actions */}
        <div className="mt-4 pt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectMeal && onSelectMeal(meal);
            }}
            className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/50 transition-colors"
          >
            View Recipe
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowPlanMenu(!showPlanMenu);
              }}
              title="Add to Meal Plan"
              className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
                plannedSuccess
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 border-transparent"
              }`}
            >
              {plannedSuccess ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>

            {/* Quick Plan Dropdown */}
            {showPlanMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 bottom-full mb-2 w-48 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-2.5 z-30"
              >
                <p className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-2">
                  Plan for Day:
                </p>
                <div className="grid grid-cols-4 gap-1 mb-2">
                  {days.map((d) => (
                    <button
                      key={d.key}
                      onClick={(e) => handleQuickPlan(e, d.key, meal.mealType || "dinner")}
                      className="text-xs py-1 rounded bg-zinc-800 hover:bg-emerald-600 hover:text-white text-zinc-300 transition-colors font-medium text-center"
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-zinc-400 text-center">
                  Slot: {meal.mealType || "dinner"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealCard;
