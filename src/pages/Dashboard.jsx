import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Flame,
  Dumbbell,
  Droplets,
  Plus,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  UtensilsCrossed,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import MealModal from "../components/MealModal";
import MealSwapModal from "../components/MealSwapModal";
import { onImageError } from "../utils/imageFallback";

const Dashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [tracker, setTracker] = useState(null);
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [copilot, setCopilot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMeal, setActiveMeal] = useState(null);
  const [swapState, setSwapState] = useState(null); // { baseMeal, plannedMealId }
  const [waterUpdating, setWaterUpdating] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [trackerRes, planRes, copilotRes] = await Promise.all([
        api.getTodayTracker(),
        api.getCurrentPlan(),
        api.getQuickCopilotRecommendation().catch(() => null),
      ]);
      setTracker(trackerRes);
      setWeeklyPlan(planRes);
      setCopilot(copilotRes);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleWaterAdd = async (deltaMl) => {
    try {
      setWaterUpdating(true);
      const res = await api.logWater({ deltaMl });
      setTracker((prev) => {
        if (!prev) return prev;
        const newCurrent = res.waterLog.amountMl;
        const target = prev.hydration.targetMl;
        return {
          ...prev,
          hydration: {
            ...prev.hydration,
            currentMl: newCurrent,
            percentage: Math.min(100, Math.round((newCurrent / target) * 100)),
          },
        };
      });
    } catch (err) {
      console.error("Failed to update water:", err);
    } finally {
      setWaterUpdating(false);
    }
  };

  const handleToggleComplete = async (plannedMeal) => {
    try {
      await api.togglePlannedMealComplete(plannedMeal.id, !plannedMeal.isCompleted);
      fetchDashboardData();
    } catch (err) {
      console.error("Failed to toggle completion:", err);
    }
  };

  // Get current weekday key (e.g. "mon", "tue", etc.)
  const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const currentDayKey = dayNames[new Date().getDay()];
  const todayPlan = weeklyPlan?.planByDay?.[currentDayKey] || null;

  const slots = [
    { key: "breakfast", label: "Breakfast", icon: "🍳" },
    { key: "lunch", label: "Lunch", icon: "🥗" },
    { key: "dinner", label: "Dinner", icon: "🍲" },
    { key: "snack", label: "Snack / Dessert", icon: "🍎" },
  ];

  const nutrition = tracker?.nutrition || {
    calories: { consumed: 0, target: 2000, remaining: 2000, percentage: 0 },
    protein: { consumed: 0, target: 120, remaining: 120, percentage: 0 },
    carbs: { consumed: 0, target: 220, remaining: 220, percentage: 0 },
    fat: { consumed: 0, target: 65, remaining: 65, percentage: 0 },
  };

  const hydration = tracker?.hydration || { currentMl: 0, targetMl: 2500, percentage: 0 };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-500/20 rounded-3xl p-6 sm:p-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Personalized Dashboard
            </span>
            <span className="text-xs text-zinc-400">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name || "Healthy Eater"}! 👋
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-xl">
            Targeting{" "}
            <span className="text-emerald-400 font-semibold">
              {profile?.goal?.replace("_", " ") || "healthy eating"}
            </span>{" "}
            with a curated daily goal of{" "}
            <span className="text-white font-semibold">{nutrition.calories.target} kcal</span>.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/ai"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask AI Nutritionist</span>
          </Link>
          <Link
            to="/meals"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs sm:text-sm border border-zinc-700 transition-all"
          >
            <UtensilsCrossed className="w-4 h-4 text-emerald-400" />
            <span>Find Meals</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Nutrition Overview & Hydration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Calories Ring & Macro Gauges (2 Cols) */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-7 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                <span>Today's Nutrition</span>
              </h2>
              <p className="text-xs text-zinc-400">Real-time daily progress & remaining allowances</p>
            </div>
            <Link
              to="/tracker"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
            >
              <span>Full Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Calories Card */}
            <div className="sm:col-span-1 bg-zinc-950 rounded-2xl p-4 border border-zinc-800 flex flex-col items-center justify-center text-center">
              <span className="text-xs text-zinc-400 font-medium mb-1">Calories Consumed</span>
              <span className="text-2xl sm:text-3xl font-black text-white">
                {nutrition.calories.consumed.toLocaleString()}
              </span>
              <span className="text-xs text-zinc-400 mt-0.5">/ {nutrition.calories.target.toLocaleString()} kcal</span>

              {/* Progress bar */}
              <div className="w-full bg-zinc-800 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, nutrition.calories.percentage)}%` }}
                />
              </div>
              <span className="text-[11px] font-semibold text-orange-400 mt-2">
                {nutrition.calories.remaining} kcal remaining
              </span>
            </div>

            {/* Macros (3 Cols) */}
            <div className="sm:col-span-3 grid grid-cols-3 gap-3">
              {/* Protein */}
              <div className="bg-zinc-950 rounded-2xl p-4 border border-zinc-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                    <span className="font-semibold text-indigo-400 flex items-center gap-1">
                      <Dumbbell className="w-3.5 h-3.5" /> Protein
                    </span>
                    <span>{nutrition.protein.percentage}%</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-black text-white">{nutrition.protein.consumed}</span>
                    <span className="text-xs text-zinc-400">/ {nutrition.protein.target}g</span>
                  </div>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, nutrition.protein.percentage)}%` }}
                  />
                </div>
                <span className="text-[10px] text-zinc-400 mt-2 block">
                  {nutrition.protein.remaining}g left
                </span>
              </div>

              {/* Carbs */}
              <div className="bg-zinc-950 rounded-2xl p-4 border border-zinc-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                    <span className="font-semibold text-amber-400">Carbs</span>
                    <span>{nutrition.carbs.percentage}%</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-black text-white">{nutrition.carbs.consumed}</span>
                    <span className="text-xs text-zinc-400">/ {nutrition.carbs.target}g</span>
                  </div>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, nutrition.carbs.percentage)}%` }}
                  />
                </div>
                <span className="text-[10px] text-zinc-400 mt-2 block">
                  {nutrition.carbs.remaining}g left
                </span>
              </div>

              {/* Fat */}
              <div className="bg-zinc-950 rounded-2xl p-4 border border-zinc-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                    <span className="font-semibold text-sky-400">Fat</span>
                    <span>{nutrition.fat.percentage}%</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-black text-white">{nutrition.fat.consumed}</span>
                    <span className="text-xs text-zinc-400">/ {nutrition.fat.target}g</span>
                  </div>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-sky-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, nutrition.fat.percentage)}%` }}
                  />
                </div>
                <span className="text-[10px] text-zinc-400 mt-2 block">
                  {nutrition.fat.remaining}g left
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Hydration Widget (1 Col) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Droplets className="w-4 h-4 text-cyan-400" />
                <span>Hydration Tracker</span>
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {hydration.percentage}%
              </span>
            </div>
            <div className="text-center py-3">
              <span className="text-3xl font-black text-white">
                {(hydration.currentMl / 1000).toFixed(2)}L
              </span>
              <span className="text-xs text-zinc-400 block mt-1">
                Target: {(hydration.targetMl / 1000).toFixed(1)}L per day
              </span>
            </div>

            <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden border border-zinc-800 mt-2">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, hydration.percentage)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-6">
            <button
              type="button"
              disabled={waterUpdating}
              onClick={() => handleWaterAdd(250)}
              className="py-2.5 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-cyan-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+250 ml (Cup)</span>
            </button>
            <button
              type="button"
              disabled={waterUpdating}
              onClick={() => handleWaterAdd(500)}
              className="py-2.5 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-cyan-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+500 ml (Bottle)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-zinc-950 px-5 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toast}</span>
        </div>
      )}

      {/* AI Copilot Real-Time Personalized Recommendation */}
      {copilot && copilot.recommendation && (
        <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-start gap-4">
            <img
              src={copilot.recommendation.imageUrl}
              alt={copilot.recommendation.title}
              onError={onImageError}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0 border border-emerald-500/20"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-emerald-500 text-zinc-950 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Copilot Recommendation
                </span>
                <span className="text-xs text-zinc-400">
                  For {copilot.nextSlot.charAt(0).toUpperCase() + copilot.nextSlot.slice(1)}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white leading-tight">
                {copilot.recommendation.title}
              </h3>
              <p className="text-xs text-zinc-300">
                You have <b className="text-orange-400">{copilot.remainingCalories} kcal</b> remaining and still need{" "}
                <b className="text-indigo-400">{copilot.remainingProtein}g protein</b> today.
              </p>
              <div className="flex items-center gap-3 text-xs text-zinc-400 pt-1">
                <span className="text-orange-400 font-bold">{copilot.recommendation.calories} kcal</span>
                <span>•</span>
                <span className="text-indigo-400 font-semibold">{copilot.recommendation.protein}g protein</span>
                <span>•</span>
                <span>{copilot.recommendation.cuisine}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-stretch sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setActiveMeal(copilot.recommendation)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors"
            >
              View Recipe
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
                  const currentDay = days[new Date().getDay()];
                  await api.planMeal({
                    mealId: copilot.recommendation.id,
                    dayOfWeek: currentDay,
                    slot: copilot.nextSlot,
                    servings: 1,
                  });
                  showToast(`Added "${copilot.recommendation.title}" to today's ${copilot.nextSlot}!`);
                  fetchDashboardData();
                } catch (e) {
                  console.error("Failed to plan copilot meal:", e);
                }
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black shadow-md shadow-emerald-500/20 transition-all"
            >
              + Add to {copilot.nextSlot.charAt(0).toUpperCase() + copilot.nextSlot.slice(1)}
            </button>
          </div>
        </div>
      )}

      {/* Today's Planned Meals Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span>Today's Meal Schedule</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Planned meals for today • Mark eaten to log calories automatically
            </p>
          </div>
          <Link
            to="/planner"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>Open Weekly Planner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {slots.map((slot) => {
            const item = todayPlan ? todayPlan[slot.key] : null;

            return (
              <div
                key={slot.key}
                className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between min-h-[220px]"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800/60">
                    <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span>{slot.icon}</span>
                      <span>{slot.label}</span>
                    </span>
                    {item && (
                      <span className="text-[10px] text-zinc-400 font-medium">
                        {item.meal.calories * item.servings} kcal
                      </span>
                    )}
                  </div>

                  {item ? (
                    <div>
                      <div
                        onClick={() => setActiveMeal(item.meal)}
                        className="cursor-pointer group"
                      >
                        <img
                          src={item.meal.imageUrl}
                          alt={item.meal.title}
                          onError={onImageError}
                          className="w-full h-24 rounded-xl object-cover mb-2 group-hover:opacity-90 transition-opacity"
                        />
                        <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                          {item.meal.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-1">
                        <span className="text-indigo-400 font-semibold">{item.meal.protein}g P</span>
                        <span>•</span>
                        <span>{item.meal.carbs}g C</span>
                        <span>•</span>
                        <span>{item.meal.fat}g F</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-28 flex flex-col items-center justify-center text-center p-2">
                      <span className="text-xs text-zinc-400 mb-2">No meal planned yet</span>
                      <Link
                        to="/meals"
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-zinc-700"
                      >
                        + Add Meal
                      </Link>
                    </div>
                  )}
                </div>

                {item && (
                  <div className="pt-3 mt-3 border-t border-zinc-800/60 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleComplete(item)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                        item.isCompleted
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-zinc-800 hover:bg-emerald-600 hover:text-white text-zinc-300"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{item.isCompleted ? "Eaten" : "Mark Eaten"}</span>
                    </button>

                    <button
                      type="button"
                      title="Swap this meal"
                      onClick={() => setSwapState({ baseMeal: item.meal, plannedMealId: item.id })}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      {activeMeal && (
        <MealModal
          meal={activeMeal}
          onClose={() => setActiveMeal(null)}
          onOpenSwap={(m) => setSwapState({ baseMeal: m, plannedMealId: null })}
          onMealLogged={() => {
            fetchDashboardData();
          }}
          onMealPlanned={() => {
            fetchDashboardData();
          }}
        />
      )}

      {swapState && (
        <MealSwapModal
          baseMeal={swapState.baseMeal}
          plannedMealId={swapState.plannedMealId}
          onClose={() => setSwapState(null)}
          onSwapCompleted={() => {
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
