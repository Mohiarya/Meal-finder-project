import React, { useState } from "react";
import {
  X,
  Clock,
  Flame,
  Dumbbell,
  Heart,
  Plus,
  Minus,
  Check,
  Calendar,
  Sparkles,
  Utensils,
  BookOpen,
} from "lucide-react";
import api from "../api";

const MealModal = ({ meal, onClose, onOpenSwap, onMealLogged, onMealPlanned }) => {
  const [servings, setServings] = useState(meal?.servings || 1);
  const [isFavorite, setIsFavorite] = useState(meal?.isFavorite || false);
  const [planDay, setPlanDay] = useState("mon");
  const [planSlot, setPlanSlot] = useState(meal?.mealType || "dinner");
  const [loggingStatus, setLoggingStatus] = useState(null);
  const [planningStatus, setPlanningStatus] = useState(null);

  if (!meal) return null;

  const multiplier = servings / (meal.servings || 1);
  const scaledCalories = Math.round(meal.calories * multiplier);
  const scaledProtein = Math.round(meal.protein * multiplier * 10) / 10;
  const scaledCarbs = Math.round(meal.carbs * multiplier * 10) / 10;
  const scaledFat = Math.round(meal.fat * multiplier * 10) / 10;

  const handleToggleFavorite = async () => {
    try {
      const res = await api.toggleFavorite(meal.id);
      setIsFavorite(res.isFavorite);
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  const handleLogMeal = async () => {
    try {
      setLoggingStatus("logging");
      await api.logMeal({
        mealId: meal.id,
        slot: planSlot,
        servings,
      });
      setLoggingStatus("success");
      if (onMealLogged) onMealLogged();
      setTimeout(() => setLoggingStatus(null), 2500);
    } catch (err) {
      console.error("Failed to log meal:", err);
      setLoggingStatus("error");
      setTimeout(() => setLoggingStatus(null), 2500);
    }
  };

  const handlePlanMeal = async () => {
    try {
      setPlanningStatus("planning");
      await api.planMeal({
        mealId: meal.id,
        dayOfWeek: planDay,
        slot: planSlot,
        servings,
      });
      setPlanningStatus("success");
      if (onMealPlanned) onMealPlanned();
      setTimeout(() => setPlanningStatus(null), 2500);
    } catch (err) {
      console.error("Failed to plan meal:", err);
      setPlanningStatus("error");
      setTimeout(() => setPlanningStatus(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-zinc-950/80 backdrop-blur-md border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image */}
        <div className="relative h-64 sm:h-80 w-full bg-zinc-950">
          <img
            src={meal.imageUrl}
            alt={meal.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/30 to-transparent" />

          {/* Badges on hero */}
          <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-zinc-950">
                  {meal.cuisine}
                </span>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-950/80 backdrop-blur-md text-zinc-300 border border-zinc-700">
                  {meal.difficulty?.toUpperCase()}
                </span>
                <div className="flex items-center gap-1 text-xs text-zinc-300 bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-zinc-700">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{meal.prepTimeMinutes + meal.cookTimeMinutes} mins total</span>
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {meal.title}
              </h2>
            </div>

            <button
              onClick={handleToggleFavorite}
              aria-label="Toggle Favorite"
              className="w-10 h-10 rounded-full bg-zinc-950/80 backdrop-blur-md border border-zinc-700 flex items-center justify-center text-zinc-300 hover:text-red-400 transition-colors"
            >
              <Heart
                className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
            {meal.description}
          </p>

          {/* Serving Scaler & Macro Overview */}
          <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">
                  Dynamic Nutrition Scaler
                </span>
                <p className="text-xs text-zinc-400">
                  Adjust portions to recalculate macros and ingredient weights automatically.
                </p>
              </div>

              {/* Counter */}
              <div className="flex items-center gap-3 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-700 self-start sm:self-auto">
                <span className="text-xs text-zinc-400 font-medium">Servings:</span>
                <button
                  type="button"
                  onClick={() => setServings((s) => Math.max(1, s - 1))}
                  className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-200"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold text-white text-sm w-4 text-center">{servings}</span>
                <button
                  type="button"
                  onClick={() => setServings((s) => Math.min(8, s + 1))}
                  className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Scaled Macro Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="bg-zinc-900/90 rounded-xl p-3 border border-zinc-800 text-center">
                <span className="text-xs text-zinc-400 flex items-center justify-center gap-1 mb-1">
                  <Flame className="w-3.5 h-3.5 text-orange-400" /> Calories
                </span>
                <span className="text-xl font-black text-white">{scaledCalories}</span>
                <span className="text-[10px] text-zinc-400 ml-1">kcal</span>
              </div>
              <div className="bg-zinc-900/90 rounded-xl p-3 border border-zinc-800 text-center">
                <span className="text-xs text-zinc-400 flex items-center justify-center gap-1 mb-1">
                  <Dumbbell className="w-3.5 h-3.5 text-indigo-400" /> Protein
                </span>
                <span className="text-xl font-black text-indigo-400">{scaledProtein}</span>
                <span className="text-[10px] text-zinc-400 ml-1">g</span>
              </div>
              <div className="bg-zinc-900/90 rounded-xl p-3 border border-zinc-800 text-center">
                <span className="text-xs text-zinc-400 mb-1 block">Carbs</span>
                <span className="text-xl font-black text-amber-400">{scaledCarbs}</span>
                <span className="text-[10px] text-zinc-400 ml-1">g</span>
              </div>
              <div className="bg-zinc-900/90 rounded-xl p-3 border border-zinc-800 text-center">
                <span className="text-xs text-zinc-400 mb-1 block">Fat</span>
                <span className="text-xl font-black text-sky-400">{scaledFat}</span>
                <span className="text-[10px] text-zinc-400 ml-1">g</span>
              </div>
            </div>
          </div>

          {/* Ingredients Section */}
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2 mb-3">
              <Utensils className="w-4 h-4 text-emerald-400" />
              <span>Ingredients ({meal.ingredients?.length || 0})</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(meal.ingredients || []).map((mi, idx) => {
                const scaledAmount = Math.round(mi.amount * multiplier * 10) / 10;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-sm"
                  >
                    <span className="text-zinc-200">{mi.ingredient?.name || mi.name}</span>
                    <span className="font-semibold text-emerald-400 text-xs">
                      {scaledAmount} {mi.unit}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instructions Section */}
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Preparation Steps</span>
            </h4>
            <ol className="space-y-2.5">
              {(meal.instructions || []).map((step, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60 text-sm text-zinc-300 leading-relaxed"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Swap Meal trigger */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSwap && onOpenSwap(meal);
              }}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Smart Swap Similar Meal</span>
            </button>

            <div className="flex items-center gap-2">
              {/* Plan dropdowns */}
              <select
                value={planDay}
                onChange={(e) => setPlanDay(e.target.value)}
                className="bg-zinc-950 border border-zinc-700 text-xs rounded-xl px-2.5 py-2.5 text-zinc-200"
              >
                <option value="mon">Mon</option>
                <option value="tue">Tue</option>
                <option value="wed">Wed</option>
                <option value="thu">Thu</option>
                <option value="fri">Fri</option>
                <option value="sat">Sat</option>
                <option value="sun">Sun</option>
              </select>

              <select
                value={planSlot}
                onChange={(e) => setPlanSlot(e.target.value)}
                className="bg-zinc-950 border border-zinc-700 text-xs rounded-xl px-2.5 py-2.5 text-zinc-200 capitalize"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>

              {/* Add to plan */}
              <button
                type="button"
                onClick={handlePlanMeal}
                className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors"
              >
                {planningStatus === "success" ? <Check className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                <span>{planningStatus === "success" ? "Planned!" : "Add to Plan"}</span>
              </button>

              {/* Log as eaten */}
              <button
                type="button"
                onClick={handleLogMeal}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-400 hover:bg-emerald-300 text-zinc-950 flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-500/20"
              >
                {loggingStatus === "success" ? <Check className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
                <span>{loggingStatus === "success" ? "Logged!" : "Log as Eaten"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealModal;
