import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Check,
  RotateCcw,
  Copy,
  Calendar,
  CheckCircle2,
  Sparkles,
  Layers,
} from "lucide-react";
import api from "../api";

const GroceryPage = () => {
  const [groceryData, setGroceryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchGrocery = async () => {
    try {
      setLoading(true);
      const res = await api.getGroceryList();
      setGroceryData(res);
    } catch (err) {
      console.error("Failed to load grocery list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrocery();
  }, []);

  const handleToggle = async (item) => {
    try {
      const nextChecked = !item.isChecked;
      await api.toggleGroceryItem({
        name: item.name,
        unit: item.unit,
        isChecked: nextChecked,
      });

      setGroceryData((prev) => {
        if (!prev) return prev;
        const updatedItems = prev.items.map((i) =>
          i.name === item.name && i.unit === item.unit ? { ...i, isChecked: nextChecked } : i
        );

        const updatedCategories = {};
        Object.keys(prev.categories).forEach((cat) => {
          updatedCategories[cat] = prev.categories[cat].map((i) =>
            i.name === item.name && i.unit === item.unit ? { ...i, isChecked: nextChecked } : i
          );
        });

        return {
          ...prev,
          items: updatedItems,
          categories: updatedCategories,
          checkedCount: updatedItems.filter((i) => i.isChecked).length,
        };
      });
    } catch (err) {
      console.error("Failed to toggle item:", err);
    }
  };

  const handleClearChecked = async () => {
    try {
      await api.clearCheckedGrocery({});
      fetchGrocery();
    } catch (err) {
      console.error("Failed to clear checked items:", err);
    }
  };

  const handleCopyClipboard = () => {
    if (!groceryData || !groceryData.items.length) return;
    let text = "🛒 MealFinder Weekly Grocery List\n\n";
    Object.keys(groceryData.categories).forEach((cat) => {
      text += `[${cat.toUpperCase()}]\n`;
      groceryData.categories[cat].forEach((item) => {
        text += `• ${item.name} - ${item.amount} ${item.unit} ${item.isChecked ? "(Done)" : ""}\n`;
      });
      text += "\n";
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const categories = groceryData?.categories || {};
  const totalItems = groceryData?.totalItems || 0;
  const checkedCount = groceryData?.checkedCount || 0;
  const progressPercent = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <ShoppingCart className="w-7 h-7 text-emerald-400" />
            <span>Consolidated Grocery List</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Ingredients auto-consolidated from your weekly meal plan
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopyClipboard}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Copied!" : "Copy List"}</span>
          </button>
          <button
            type="button"
            onClick={handleClearChecked}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Checks</span>
          </button>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-sm">
            {progressPercent}%
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Shopping Progress</h3>
            <p className="text-xs text-zinc-400">
              {checkedCount} of {totalItems} ingredients acquired
            </p>
          </div>
        </div>

        <div className="w-full sm:w-64 bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-800">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Empty State */}
      {totalItems === 0 && !loading && (
        <div className="py-20 text-center bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
          <ShoppingCart className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Ingredients Found</h3>
          <p className="text-sm text-zinc-400 mt-1 max-w-sm mx-auto">
            Your grocery list builds automatically when you schedule meals in the Weekly Planner!
          </p>
          <Link
            to="/planner"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md shadow-emerald-500/20"
          >
            <Calendar className="w-4 h-4" />
            <span>Open Meal Planner</span>
          </Link>
        </div>
      )}

      {/* Categorized Grocery Sections */}
      <div className="space-y-6">
        {Object.keys(categories).map((catName) => {
          const items = categories[catName];

          return (
            <div
              key={catName}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-3"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{catName}</span>
                </h3>
                <span className="text-xs text-zinc-400 font-medium">
                  {items.filter((i) => i.isChecked).length} / {items.length} completed
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggle(item)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                      item.isChecked
                        ? "bg-zinc-950/40 border-zinc-800/40 text-zinc-500 opacity-60 line-through"
                        : "bg-zinc-950/90 border-zinc-800 text-zinc-200 hover:border-emerald-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${
                          item.isChecked
                            ? "bg-emerald-500 text-zinc-950 font-bold"
                            : "border border-zinc-700 bg-zinc-900"
                        }`}
                      >
                        {item.isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <span className="text-xs font-semibold block">{item.name}</span>
                        {item.usedIn && item.usedIn.length > 0 && (
                          <span className="text-[10px] text-zinc-500 line-clamp-1">
                            Used in: {item.usedIn.join(", ")}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold ${
                        item.isChecked ? "text-zinc-500" : "text-emerald-400"
                      }`}
                    >
                      {item.amount} {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GroceryPage;
