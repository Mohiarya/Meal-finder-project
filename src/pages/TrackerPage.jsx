import React, { useState, useEffect } from "react";
import {
  Activity,
  Flame,
  Dumbbell,
  Droplets,
  Plus,
  Trash2,
  TrendingUp,
  Award,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import api from "../api";
import { useAuth } from "../context/AuthContext";

const TrackerPage = () => {
  const { profile } = useAuth();
  const [todayData, setTodayData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customModal, setCustomModal] = useState(false);
  const [customForm, setCustomForm] = useState({
    customTitle: "",
    slot: "lunch",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [todayRes, analyticsRes] = await Promise.all([
        api.getTodayTracker(),
        api.getWeeklyAnalytics(),
      ]);
      setTodayData(todayRes);
      setAnalytics(analyticsRes);
    } catch (err) {
      console.error("Failed to load tracker analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogCustomMeal = async (e) => {
    e.preventDefault();
    try {
      await api.logMeal(customForm);
      setCustomModal(false);
      setCustomForm({
        customTitle: "",
        slot: "lunch",
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
      });
      fetchData();
    } catch (err) {
      console.error("Failed to log custom meal:", err);
    }
  };

  const handleDeleteLog = async (id) => {
    try {
      await api.deleteMealLog(id);
      fetchData();
    } catch (err) {
      console.error("Failed to delete log:", err);
    }
  };

  const handleWaterAdd = async (deltaMl) => {
    try {
      await api.logWater({ deltaMl });
      fetchData();
    } catch (err) {
      console.error("Failed to add water:", err);
    }
  };

  const nutrition = todayData?.nutrition || {
    calories: { consumed: 0, target: 2000, remaining: 2000, percentage: 0 },
    protein: { consumed: 0, target: 120, remaining: 120, percentage: 0 },
    carbs: { consumed: 0, target: 220, remaining: 220, percentage: 0 },
    fat: { consumed: 0, target: 65, remaining: 65, percentage: 0 },
  };

  const hydration = todayData?.hydration || { currentMl: 0, targetMl: 2500, percentage: 0 };
  const mealsBySlot = todayData?.mealsBySlot || { breakfast: [], lunch: [], dinner: [], snack: [] };

  const slots = [
    { key: "breakfast", label: "Breakfast" },
    { key: "lunch", label: "Lunch" },
    { key: "dinner", label: "Dinner" },
    { key: "snack", label: "Snacks" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-emerald-400" />
            <span>Calorie & Nutrition Tracking</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Log foods, verify macro targets, and analyze 7-day adherence trends.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCustomModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Quick Log Custom Food</span>
        </button>
      </div>

      {/* Primary Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 text-center flex flex-col justify-between">
          <span className="text-xs text-zinc-400 font-medium">Daily Energy Target</span>
          <div className="my-2">
            <span className="text-3xl font-black text-white">{nutrition.calories.consumed}</span>
            <span className="text-xs text-zinc-400 ml-1">/ {nutrition.calories.target} kcal</span>
          </div>
          <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="bg-orange-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, nutrition.calories.percentage)}%` }}
            />
          </div>
          <span className="text-xs font-bold text-orange-400 mt-2 block">
            {nutrition.calories.remaining} kcal remaining
          </span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 text-center flex flex-col justify-between">
          <span className="text-xs text-zinc-400 font-medium">Protein Target</span>
          <div className="my-2">
            <span className="text-3xl font-black text-indigo-400">{nutrition.protein.consumed}g</span>
            <span className="text-xs text-zinc-400 ml-1">/ {nutrition.protein.target}g</span>
          </div>
          <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, nutrition.protein.percentage)}%` }}
            />
          </div>
          <span className="text-xs font-bold text-indigo-400 mt-2 block">
            {nutrition.protein.remaining}g remaining
          </span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 text-center flex flex-col justify-between">
          <span className="text-xs text-zinc-400 font-medium">Carbohydrates Target</span>
          <div className="my-2">
            <span className="text-3xl font-black text-amber-400">{nutrition.carbs.consumed}g</span>
            <span className="text-xs text-zinc-400 ml-1">/ {nutrition.carbs.target}g</span>
          </div>
          <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="bg-amber-400 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, nutrition.carbs.percentage)}%` }}
            />
          </div>
          <span className="text-xs font-bold text-amber-400 mt-2 block">
            {nutrition.carbs.remaining}g remaining
          </span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 text-center flex flex-col justify-between">
          <span className="text-xs text-zinc-400 font-medium">Daily Water Log</span>
          <div className="my-2">
            <span className="text-3xl font-black text-cyan-400">
              {(hydration.currentMl / 1000).toFixed(2)}L
            </span>
            <span className="text-xs text-zinc-400 ml-1">/ {(hydration.targetMl / 1000).toFixed(1)}L</span>
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <button
              onClick={() => handleWaterAdd(250)}
              className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-bold text-cyan-400"
            >
              +250ml
            </button>
            <button
              onClick={() => handleWaterAdd(500)}
              className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-bold text-cyan-400"
            >
              +500ml
            </button>
          </div>
        </div>
      </div>

      {/* Today's Diary Slots */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <span>Today's Logged Meals Diary</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slots.map((s) => {
            const list = mealsBySlot[s.key] || [];

            return (
              <div
                key={s.key}
                className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800/80">
                    <h4 className="text-sm font-bold text-zinc-200 capitalize">{s.label}</h4>
                    <span className="text-xs text-zinc-400">
                      {list.reduce((sum, item) => sum + item.calories, 0)} kcal
                    </span>
                  </div>

                  {list.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-4 text-center">No meals logged for {s.label}.</p>
                  ) : (
                    <div className="space-y-2">
                      {list.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs"
                        >
                          <div>
                            <span className="font-bold text-white block">{item.mealTitle}</span>
                            <span className="text-zinc-400 text-[11px]">
                              {item.calories} kcal • {item.protein}g P • {item.carbs}g C • {item.fat}g F
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteLog(item.id)}
                            className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7-Day Analytics & Insights */}
      {analytics && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>7-Day Calorie & Macro Analytics</span>
            </h2>
            <p className="text-xs text-zinc-400">Interactive trends over the past 7 days</p>
          </div>

          {/* Recharts Bar Chart */}
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#71717a" fontSize={12} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#3f3f46",
                    borderRadius: "12px",
                    color: "#f4f4f5",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <ReferenceLine
                  y={analytics.summary.targetCalories}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{ value: "Target", fill: "#10b981", fontSize: 11 }}
                />
                <Bar dataKey="calories" fill="#f97316" name="Calories (kcal)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="protein" fill="#6366f1" name="Protein (g)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Data-Driven Observations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-800/80">
            {(analytics.insights || []).map((ins, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-start gap-3 text-xs text-zinc-300 leading-relaxed"
              >
                <Award className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{ins}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Custom Meal Modal */}
      {customModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Log Custom Food</h3>
            <p className="text-xs text-zinc-400 mb-4">Add non-recipe meals or restaurant items</p>

            <form onSubmit={handleLogCustomMeal} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Food Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scrambled Eggs & Sourdough"
                  value={customForm.customTitle}
                  onChange={(e) => setCustomForm({ ...customForm, customTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Meal Slot</label>
                  <select
                    value={customForm.slot}
                    onChange={(e) => setCustomForm({ ...customForm, slot: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 capitalize"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 420"
                    value={customForm.calories}
                    onChange={(e) => setCustomForm({ ...customForm, calories: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Protein (g)</label>
                  <input
                    type="number"
                    placeholder="25"
                    value={customForm.protein}
                    onChange={(e) => setCustomForm({ ...customForm, protein: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    placeholder="30"
                    value={customForm.carbs}
                    onChange={(e) => setCustomForm({ ...customForm, carbs: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Fat (g)</label>
                  <input
                    type="number"
                    placeholder="12"
                    value={customForm.fat}
                    onChange={(e) => setCustomForm({ ...customForm, fat: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setCustomModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950"
                >
                  Log Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackerPage;
