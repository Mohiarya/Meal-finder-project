import React, { useState, useEffect } from "react";
import { X, Sparkles, Flame, Dumbbell, Clock, ArrowRightLeft, Check } from "lucide-react";
import api from "../api";
import { onImageError } from "../utils/imageFallback";

const MealSwapModal = ({ baseMeal, plannedMealId, onClose, onSwapCompleted }) => {
  const [filter, setFilter] = useState("");
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [swappingId, setSwappingId] = useState(null);

  useEffect(() => {
    if (!baseMeal) return;
    const fetchOptions = async () => {
      try {
        setLoading(true);
        const res = await api.getSwapOptions(baseMeal.id, filter);
        setAlternatives(res.alternatives || []);
      } catch (err) {
        console.error("Failed to load swap alternatives:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, [baseMeal, filter]);

  if (!baseMeal) return null;

  const handleExecuteSwap = async (newMeal) => {
    try {
      setSwappingId(newMeal.id);
      if (plannedMealId) {
        await api.swapMeal({
          plannedMealId,
          newMealId: newMeal.id,
        });
      }
      if (onSwapCompleted) {
        onSwapCompleted(newMeal);
      }
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      console.error("Failed to execute swap:", err);
      setSwappingId(null);
    }
  };

  const filterButtons = [
    { label: "All Closest", value: "" },
    { label: "Higher Protein", value: "higher_protein" },
    { label: "Lower Calorie", value: "lower_calorie" },
    { label: "Vegetarian", value: "vegetarian" },
    { label: "Faster Prep", value: "faster" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Smart Meal Swap</h3>
              <p className="text-xs text-zinc-400">
                Replace with nutritionally comparable alternatives
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Base Meal Reference Card */}
        <div className="mt-4 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={baseMeal.imageUrl}
              alt={baseMeal.title}
              onError={onImageError}
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                Current Meal
              </span>
              <h4 className="text-sm font-bold text-white">{baseMeal.title}</h4>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="font-bold text-orange-400">{baseMeal.calories} kcal</span>
            <span className="font-bold text-indigo-400">{baseMeal.protein}g P</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          {filterButtons.map((fb) => (
            <button
              key={fb.value}
              type="button"
              onClick={() => setFilter(fb.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === fb.value
                  ? "bg-emerald-500 text-zinc-950 font-bold"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {fb.label}
            </button>
          ))}
        </div>

        {/* Alternatives List */}
        <div className="mt-4 max-h-80 overflow-y-auto space-y-2.5 pr-1">
          {loading ? (
            <div className="py-12 text-center text-zinc-400 text-sm">
              Analyzing nutritional profiles...
            </div>
          ) : alternatives.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-sm">
              No matching alternatives found for this filter.
            </div>
          ) : (
            alternatives.map((alt) => {
              const isSwapping = swappingId === alt.id;
              const calDiff = alt.calorieDifference;
              const protDiff = alt.proteinDifference;

              return (
                <div
                  key={alt.id}
                  className="p-3 rounded-2xl bg-zinc-950/60 hover:bg-zinc-950 border border-zinc-800/80 hover:border-emerald-500/30 flex items-center justify-between gap-3 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={alt.imageUrl}
                      alt={alt.title}
                      onError={onImageError}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <h5 className="text-sm font-bold text-white line-clamp-1">{alt.title}</h5>
                      <div className="flex items-center gap-3 text-xs mt-1">
                        <span className="text-zinc-300 font-medium">{alt.calories} kcal</span>
                        <span className="text-indigo-400 font-semibold">{alt.protein}g protein</span>
                        <span className="text-zinc-400 text-[11px] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          {alt.prepTimeMinutes + alt.cookTimeMinutes}m
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            calDiff <= 0
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-orange-500/10 text-orange-400"
                          }`}
                        >
                          {calDiff > 0 ? `+${calDiff}` : calDiff} kcal
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            protDiff >= 0
                              ? "bg-indigo-500/10 text-indigo-400"
                              : "bg-zinc-500/10 text-zinc-400"
                          }`}
                        >
                          {protDiff > 0 ? `+${protDiff}g` : `${protDiff}g`} P
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleExecuteSwap(alt)}
                    disabled={isSwapping}
                    className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center gap-1 transition-colors shadow-sm shadow-emerald-500/20"
                  >
                    {isSwapping ? <Check className="w-4 h-4" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>{isSwapping ? "Swapped" : "Swap"}</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default MealSwapModal;
