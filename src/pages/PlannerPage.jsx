import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Copy,
  Flame,
  Dumbbell,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import MealModal from "../components/MealModal";
import MealSwapModal from "../components/MealSwapModal";
import { onImageError } from "../utils/imageFallback";

const PlannerPage = () => {
  const { profile } = useAuth();
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState("mon");
  const [activeMeal, setActiveMeal] = useState(null);
  const [swapState, setSwapState] = useState(null);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicateTargetDay, setDuplicateTargetDay] = useState("tue");
  const [quickAddModal, setQuickAddModal] = useState(null); // { day, slot }
  const [availableMeals, setAvailableMeals] = useState([]);
  const [quickSearch, setQuickSearch] = useState("");

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const res = await api.getCurrentPlan();
      setPlanData(res);
    } catch (err) {
      console.error("Failed to load weekly plan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const handleOpenQuickAdd = async (day, slot) => {
    setQuickAddModal({ day, slot });
    if (availableMeals.length === 0) {
      try {
        const res = await api.getMeals();
        setAvailableMeals(res.meals || []);
      } catch (e) {
        console.error("Failed to fetch meals for quick add:", e);
      }
    }
  };

  const handleAssignMeal = async (meal) => {
    if (!quickAddModal) return;
    try {
      await api.planMeal({
        mealId: meal.id,
        dayOfWeek: quickAddModal.day,
        slot: quickAddModal.slot,
        servings: 1,
      });
      setQuickAddModal(null);
      fetchPlan();
    } catch (err) {
      console.error("Failed to assign meal:", err);
    }
  };

  const handleRemoveMeal = async (plannedMealId) => {
    try {
      await api.removePlannedMeal(plannedMealId);
      fetchPlan();
    } catch (err) {
      console.error("Failed to remove meal:", err);
    }
  };

  const handleToggleComplete = async (plannedMeal) => {
    try {
      await api.togglePlannedMealComplete(plannedMeal.id, !plannedMeal.isCompleted);
      fetchPlan();
    } catch (err) {
      console.error("Failed to toggle completion:", err);
    }
  };

  const handleDuplicateDay = async () => {
    try {
      await api.duplicateDay({
        fromDay: selectedDay,
        toDay: duplicateTargetDay,
      });
      setDuplicateModalOpen(false);
      fetchPlan();
    } catch (err) {
      console.error("Failed to duplicate day:", err);
    }
  };

  const days = [
    { key: "mon", label: "Monday", short: "Mon" },
    { key: "tue", label: "Tuesday", short: "Tue" },
    { key: "wed", label: "Wednesday", short: "Wed" },
    { key: "thu", label: "Thursday", short: "Thu" },
    { key: "fri", label: "Friday", short: "Fri" },
    { key: "sat", label: "Saturday", short: "Sat" },
    { key: "sun", label: "Sunday", short: "Sun" },
  ];

  const slots = [
    { key: "breakfast", label: "Breakfast", icon: "🍳" },
    { key: "lunch", label: "Lunch", icon: "🥗" },
    { key: "dinner", label: "Dinner", icon: "🍲" },
    { key: "snack", label: "Snack / Dessert", icon: "🍎" },
  ];

  const currentDayPlan = planData?.planByDay?.[selectedDay] || null;
  const targetCalories = profile?.dailyCalorieTarget || 2000;
  const targetProtein = profile?.proteinTarget || 120;

  const filteredQuickMeals = availableMeals.filter((m) =>
    quickSearch ? m.title.toLowerCase().includes(quickSearch.toLowerCase()) : true
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CalendarDays className="w-7 h-7 text-emerald-400" />
            <span>Weekly Meal Architecture</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Build your personalized week • Target macros dynamically compute per day
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDuplicateModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
          >
            <Copy className="w-4 h-4 text-emerald-400" />
            <span>Duplicate Day Plan</span>
          </button>
          <Link
            to="/grocery"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-colors"
          >
            <span>Generate Groceries</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Weekday Selector Bar */}
      <div className="grid grid-cols-7 gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-2">
        {days.map((d) => {
          const dayPlan = planData?.planByDay?.[d.key];
          const isSelected = selectedDay === d.key;
          const cal = dayPlan ? dayPlan.totalCalories : 0;

          return (
            <button
              key={d.key}
              type="button"
              onClick={() => setSelectedDay(d.key)}
              className={`p-2.5 sm:p-3 rounded-xl flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? "bg-emerald-500 text-zinc-950 font-bold shadow-lg shadow-emerald-500/20"
                  : "bg-zinc-950/60 hover:bg-zinc-800/80 text-zinc-300"
              }`}
            >
              <span className="text-xs sm:text-sm uppercase font-bold tracking-wider">{d.short}</span>
              <span className={`text-[11px] mt-1 ${isSelected ? "text-zinc-950 font-extrabold" : "text-zinc-400"}`}>
                {cal > 0 ? `${cal} kcal` : "Empty"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Day Macro Summary Bar */}
      {currentDayPlan && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-white capitalize">
              {days.find((d) => d.key === selectedDay)?.label} Target:
            </span>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-extrabold text-orange-400">
                {currentDayPlan.totalCalories} / {targetCalories} kcal
              </span>
              <span className="text-zinc-500">•</span>
              <span className="font-extrabold text-indigo-400">
                {currentDayPlan.totalProtein}g / {targetProtein}g Protein
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span>Carbs: <b className="text-amber-400">{currentDayPlan.totalCarbs}g</b></span>
            <span>•</span>
            <span>Fat: <b className="text-sky-400">{currentDayPlan.totalFat}g</b></span>
          </div>
        </div>
      )}

      {/* 4 Meal Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {slots.map((slot) => {
          const item = currentDayPlan ? currentDayPlan[slot.key] : null;

          return (
            <div
              key={slot.key}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between min-h-[320px]"
            >
              <div>
                {/* Slot Header */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="text-base">{slot.icon}</span>
                    <span>{slot.label}</span>
                  </span>
                  {item && (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {item.meal.calories * item.servings} kcal
                    </span>
                  )}
                </div>

                {item ? (
                  <div className="space-y-3">
                    <div
                      onClick={() => setActiveMeal(item.meal)}
                      className="cursor-pointer group"
                    >
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-950 mb-2">
                        <img
                          src={item.meal.imageUrl}
                          alt={item.meal.title}
                          onError={onImageError}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {item.isCompleted && (
                          <div className="absolute inset-0 bg-emerald-950/70 backdrop-blur-xs flex items-center justify-center gap-1.5 text-emerald-300 font-bold text-xs">
                            <CheckCircle2 className="w-5 h-5" />
                            <span>Logged as Eaten</span>
                          </div>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                        {item.meal.title}
                      </h4>
                      <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">
                        {item.meal.description}
                      </p>
                    </div>

                    {/* Macro pills */}
                    <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                      <div className="bg-zinc-950 rounded-lg py-1 px-1 border border-zinc-800/80">
                        <span className="text-[10px] text-zinc-400 block">P</span>
                        <span className="font-bold text-indigo-400">{item.meal.protein}g</span>
                      </div>
                      <div className="bg-zinc-950 rounded-lg py-1 px-1 border border-zinc-800/80">
                        <span className="text-[10px] text-zinc-400 block">C</span>
                        <span className="font-bold text-amber-400">{item.meal.carbs}g</span>
                      </div>
                      <div className="bg-zinc-950 rounded-lg py-1 px-1 border border-zinc-800/80">
                        <span className="text-[10px] text-zinc-400 block">F</span>
                        <span className="font-bold text-sky-400">{item.meal.fat}g</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center flex flex-col items-center justify-center">
                    <p className="text-xs text-zinc-400 mb-3">No meal scheduled</p>
                    <button
                      type="button"
                      onClick={() => handleOpenQuickAdd(selectedDay, slot.key)}
                      className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-emerald-600 hover:text-white text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-zinc-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Select Meal</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Slot Bottom Actions */}
              {item && (
                <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleComplete(item)}
                    className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      item.isCompleted
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{item.isCompleted ? "Eaten" : "Log Eaten"}</span>
                  </button>

                  <button
                    type="button"
                    title="Swap meal"
                    onClick={() => setSwapState({ baseMeal: item.meal, plannedMealId: item.id })}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-amber-400 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    title="Remove from plan"
                    onClick={() => handleRemoveMeal(item.id)}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Add Meal Modal */}
      {quickAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white capitalize">
                Plan {quickAddModal.slot} for {days.find((d) => d.key === quickAddModal.day)?.label}
              </h3>
              <button
                onClick={() => setQuickAddModal(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4">
              <input
                type="text"
                placeholder="Search recipe..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="mt-3 max-h-72 overflow-y-auto space-y-2 pr-1">
              {filteredQuickMeals.map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleAssignMeal(m)}
                  className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={m.imageUrl}
                      alt={m.title}
                      onError={onImageError}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div>
                      <h5 className="text-xs font-bold text-white">{m.title}</h5>
                      <span className="text-[11px] text-zinc-400">
                        {m.calories} kcal • {m.protein}g protein
                      </span>
                    </div>
                  </div>
                  <button className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs">
                    Select
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Day Modal */}
      {duplicateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Duplicate Daily Schedule</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Copy all meals from{" "}
              <b className="text-emerald-400 uppercase">{selectedDay}</b> to another day:
            </p>

            <select
              value={duplicateTargetDay}
              onChange={(e) => setDuplicateTargetDay(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-zinc-200 mb-5"
            >
              {days
                .filter((d) => d.key !== selectedDay)
                .map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.label}
                  </option>
                ))}
            </select>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDuplicateModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDuplicateDay}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950"
              >
                Confirm Duplicate
              </button>
            </div>
          </div>
        </div>
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
          onSwapCompleted={() => fetchPlan()}
        />
      )}
    </div>
  );
};

export default PlannerPage;
