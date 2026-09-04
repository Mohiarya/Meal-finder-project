import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Send,
  ChefHat,
  Utensils,
  Plus,
  X,
  Flame,
  Dumbbell,
  Clock,
  ArrowRight,
  Bot,
  User,
  CheckCircle2,
  Heart,
  ShoppingCart,
  Calendar,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import MealModal from "../components/MealModal";
import { onImageError } from "../utils/imageFallback";

const AIAssistantPage = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("assistant");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Today's tracker context for smart prompts
  const [todayTracker, setTodayTracker] = useState(null);

  // Messages in copilot
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      headline: "AI Nutrition Copilot Ready",
      reason:
        "Welcome! I analyze your live daily calorie budget, protein goals, and dietary preferences to recommend exact chef-verified meals from our database.",
      nutritionTip: "Ask questions with multiple constraints—like calories, meal slots, or ingredients—and I'll filter our verified database.",
      bestMatch: null,
      recommendations: [],
    },
  ]);

  // "Cook with what I have" state
  const [ingredientInput, setIngredientInput] = useState("");
  const [pantryIngredients, setPantryIngredients] = useState(["Eggs", "Rice", "Spinach", "Onion"]);
  const [matchedRecipes, setMatchedRecipes] = useState([]);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [addingGrocery, setAddingGrocery] = useState(null);

  // Active modal
  const [activeMeal, setActiveMeal] = useState(null);

  useEffect(() => {
    const fetchTracker = async () => {
      try {
        const res = await api.getTodayTracker();
        setTodayTracker(res);
      } catch (e) {
        console.error("Failed to load today's tracker for AI assistant:", e);
      }
    };
    fetchTracker();
  }, []);

  const showToast = (text) => {
    setToast(text);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSendMessage = async (customPrompt) => {
    const textToSend = customPrompt || prompt;
    if (!textToSend || !textToSend.trim() || loading) return;

    const userMsg = { role: "user", text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt("");
    setLoading(true);

    try {
      const res = await api.askAssistant(textToSend);
      const assistantMsg = {
        role: "assistant",
        headline: res.headline,
        reason: res.reason,
        nutritionTip: res.nutritionTip,
        intent: res.intent,
        bestMatch: res.bestMatch,
        recommendations: res.recommendations || [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("AI Assistant error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          headline: "Service Notice",
          reason: "I encountered an issue processing that query. Please try rephrasing your request.",
          nutritionTip: "You can also manually browse all meals in the Meal Finder.",
          bestMatch: null,
          recommendations: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredient = (e) => {
    e.preventDefault();
    if (!ingredientInput.trim()) return;
    const clean = ingredientInput.trim();
    if (!pantryIngredients.some((i) => i.toLowerCase() === clean.toLowerCase())) {
      setPantryIngredients([...pantryIngredients, clean]);
    }
    setIngredientInput("");
  };

  const handleRemoveIngredient = (ing) => {
    setPantryIngredients(pantryIngredients.filter((i) => i !== ing));
  };

  const handleCookSearch = async () => {
    if (pantryIngredients.length === 0) return;
    try {
      setMatchingLoading(true);
      const res = await api.cookWithIngredients(pantryIngredients);
      setMatchedRecipes(res.matches || []);
    } catch (err) {
      console.error("Failed to match recipes:", err);
    } finally {
      setMatchingLoading(false);
    }
  };

  // Direct action: Add to today's plan
  const handleAddToPlan = async (meal, slot = "dinner") => {
    try {
      const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      const currentDay = days[new Date().getDay()];
      await api.planMeal({
        mealId: meal.id,
        dayOfWeek: currentDay,
        slot: slot || meal.mealType || "dinner",
        servings: 1,
      });
      showToast(`Added "${meal.title}" to today's ${slot}!`);
    } catch (err) {
      console.error("Failed to plan meal:", err);
    }
  };

  // Direct action: Log as eaten
  const handleLogMeal = async (meal, slot = "dinner") => {
    try {
      await api.logMeal({
        mealId: meal.id,
        slot: slot || meal.mealType || "dinner",
        servings: 1,
      });
      showToast(`Logged "${meal.title}" (+${meal.calories} kcal) to today's diary!`);
    } catch (err) {
      console.error("Failed to log meal:", err);
    }
  };

  // Direct action: Add missing ingredients to Grocery List
  const handleAddMissingToGrocery = async (recipe) => {
    if (!recipe.missingIngredients || recipe.missingIngredients.length === 0) return;
    try {
      setAddingGrocery(recipe.id);
      await api.addGroceryItems(recipe.missingIngredients);
      showToast(`Added ${recipe.missingIngredients.length} missing items to your Grocery List!`);
    } catch (err) {
      console.error("Failed to add missing ingredients to grocery:", err);
    } finally {
      setAddingGrocery(null);
    }
  };

  const remCal = todayTracker?.nutrition?.calories?.remaining || 500;
  const remProt = todayTracker?.nutrition?.protein?.remaining || 35;

  const quickPrompts = [
    `I have ${remCal} calories left. What should I eat?`,
    "Give me a high-protein vegetarian dinner.",
    "Recommend a quick breakfast under 400 calories.",
    `Help me hit my remaining ${remProt}g protein target.`,
    "I need a low-calorie high-protein meal.",
    "Replace today's dinner with something vegetarian under 500 calories.",
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-zinc-950 px-5 py-3.5 rounded-2xl font-bold shadow-2xl flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Bar with Live Metric Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              AI Nutrition Copilot
            </span>
            <span className="text-xs text-zinc-400">
              Target: {profile?.goal?.replace("_", " ") || "healthy eating"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-emerald-400" />
            <span>Intelligent Culinary Assistant</span>
          </h1>
        </div>

        {/* Live Daily Budget Pill */}
        <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800/90 rounded-2xl p-3 self-start md:self-auto">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Remaining Today</span>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-extrabold text-orange-400">{remCal} kcal</span>
              <span className="text-zinc-600">•</span>
              <span className="font-extrabold text-indigo-400">{remProt}g protein</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab("assistant")}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "assistant"
              ? "bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20"
              : "text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800"
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Nutrition Copilot Chat</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("cook");
            if (matchedRecipes.length === 0) handleCookSearch();
          }}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "cook"
              ? "bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20"
              : "text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800"
          }`}
        >
          <ChefHat className="w-4 h-4" />
          <span>Cook With What I Have</span>
        </button>
      </div>

      {/* TAB 1: COPILOT CHAT */}
      {activeTab === "assistant" && (
        <div className="space-y-6">
          {/* Messages Stream */}
          <div className="space-y-6">
            {messages.map((m, idx) => (
              <div key={idx} className="space-y-3">
                {/* User message */}
                {m.role === "user" && (
                  <div className="flex justify-end items-center gap-3">
                    <div className="bg-emerald-500 text-zinc-950 font-semibold px-4 py-3 rounded-2xl text-sm max-w-xl shadow-md shadow-emerald-500/10">
                      {m.text}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  </div>
                )}

                {/* Assistant message */}
                {m.role === "assistant" && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-1">
                      <Bot className="w-5 h-5" />
                    </div>

                    <div className="flex-1 space-y-4 max-w-3xl">
                      {/* Text rationale card */}
                      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            <span>{m.headline || "Copilot Analysis"}</span>
                          </h3>
                        </div>
                        <p className="text-sm text-zinc-300 leading-relaxed">{m.reason}</p>
                        {m.nutritionTip && (
                          <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>{m.nutritionTip}</span>
                          </div>
                        )}
                      </div>

                      {/* FEATURED BEST MATCH CARD */}
                      {m.bestMatch && (
                        <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500 text-zinc-950">
                              ✨ Best Match
                            </span>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-zinc-400 font-medium">
                                {m.bestMatch.mealType?.toUpperCase()}
                              </span>
                              <span>•</span>
                              <span className="text-emerald-400 font-bold">
                                {m.bestMatch.cuisine}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-5 items-start">
                            <img
                              src={m.bestMatch.imageUrl}
                              alt={m.bestMatch.title}
                              onError={onImageError}
                              className="w-full sm:w-44 h-36 rounded-2xl object-cover shrink-0"
                            />

                            <div className="flex-1 space-y-2">
                              <h4 className="text-lg font-extrabold text-white">
                                {m.bestMatch.title}
                              </h4>
                              <p className="text-xs text-zinc-400 line-clamp-2">
                                {m.bestMatch.description}
                              </p>

                              {/* Macro Pills Grid */}
                              <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                                <div className="bg-zinc-950 rounded-xl p-2 border border-zinc-800">
                                  <span className="text-[10px] text-zinc-400 block font-medium">Calories</span>
                                  <span className="text-sm font-extrabold text-orange-400 flex items-center justify-center gap-0.5">
                                    <Flame className="w-3 h-3" />
                                    {m.bestMatch.calories}
                                  </span>
                                </div>
                                <div className="bg-zinc-950 rounded-xl p-2 border border-zinc-800">
                                  <span className="text-[10px] text-zinc-400 block font-medium">Protein</span>
                                  <span className="text-sm font-extrabold text-indigo-400 flex items-center justify-center gap-0.5">
                                    <Dumbbell className="w-3 h-3" />
                                    {m.bestMatch.protein}g
                                  </span>
                                </div>
                                <div className="bg-zinc-950 rounded-xl p-2 border border-zinc-800">
                                  <span className="text-[10px] text-zinc-400 block font-medium">Carbs</span>
                                  <span className="text-sm font-extrabold text-amber-400">
                                    {m.bestMatch.carbs}g
                                  </span>
                                </div>
                                <div className="bg-zinc-950 rounded-xl p-2 border border-zinc-800">
                                  <span className="text-[10px] text-zinc-400 block font-medium">Fat</span>
                                  <span className="text-sm font-extrabold text-sky-400">
                                    {m.bestMatch.fat}g
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Direct Actions */}
                          <div className="pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2.5">
                            <button
                              type="button"
                              onClick={() => setActiveMeal(m.bestMatch)}
                              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors"
                            >
                              View Recipe
                            </button>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleAddToPlan(m.bestMatch, m.bestMatch.mealType || "dinner")}
                                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-emerald-600 hover:text-white text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-zinc-700"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Add to {m.bestMatch.mealType || "Dinner"}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleLogMeal(m.bestMatch, m.bestMatch.mealType || "dinner")}
                                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-500/20"
                              >
                                <Flame className="w-3.5 h-3.5" />
                                <span>Log as Eaten</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ALTERNATIVE MATCHES CARDS */}
                      {m.recommendations && m.recommendations.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                            Other Recommended Alternatives
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {m.recommendations.map((alt) => (
                              <div
                                key={alt.id}
                                className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between gap-3"
                              >
                                <div className="flex items-start gap-3">
                                  <img
                                    src={alt.imageUrl}
                                    alt={alt.title}
                                    onError={onImageError}
                                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                                  />
                                  <div className="flex-1">
                                    <h5 className="text-xs font-bold text-white line-clamp-1">
                                      {alt.title}
                                    </h5>
                                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-1">
                                      <span className="text-orange-400 font-bold">{alt.calories} kcal</span>
                                      <span>•</span>
                                      <span className="text-indigo-400 font-semibold">{alt.protein}g protein</span>
                                    </div>
                                    <span className="text-[10px] text-zinc-500 block mt-0.5">
                                      {alt.cuisine} • {alt.prepTimeMinutes + alt.cookTimeMinutes}m prep
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs">
                                  <button
                                    type="button"
                                    onClick={() => setActiveMeal(alt)}
                                    className="text-emerald-400 hover:underline font-semibold"
                                  >
                                    View
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAddToPlan(alt, alt.mealType || "dinner")}
                                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium"
                                  >
                                    + Add to Plan
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Bot className="w-5 h-5 animate-pulse" />
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-xs text-zinc-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                  <span>Filtering database by meal type, macro ratios, and dietary tags...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompt Chips */}
          <div className="pt-2">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">
              Suggested Constraints
            </span>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((qp, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(qp)}
                  className="text-xs px-3.5 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-emerald-500/40 transition-colors"
                >
                  {qp}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. 'I have 500 calories left. Give me a high-protein vegetarian dinner'..."
              className="flex-1 px-4 py-3 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="p-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-zinc-950 font-bold transition-all shadow-md shadow-emerald-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: COOK WITH WHAT I HAVE */}
      {activeTab === "cook" && (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-emerald-400" />
                <span>Pantry Match & Grocery Synchronizer</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Input your available ingredients. We'll score matching recipes and allow you to 1-click push missing items to your Grocery List!
              </p>
            </div>

            {/* Input Form */}
            <form onSubmit={handleAddIngredient} className="flex items-center gap-2">
              <input
                type="text"
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                placeholder="Type an ingredient (e.g. eggs, rice, salmon, tofu, garlic)..."
                className="flex-1 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold text-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
              <button
                type="button"
                onClick={handleCookSearch}
                className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>Find Matches</span>
              </button>
            </form>

            {/* Ingredient Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {pantryIngredients.map((ing) => (
                <span
                  key={ing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 text-xs font-semibold text-emerald-400 border border-emerald-500/20"
                >
                  <span>{ing}</span>
                  <button
                    onClick={() => handleRemoveIngredient(ing)}
                    className="hover:text-red-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Matches List */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">
              {matchingLoading ? "Matching against recipes..." : `Top Grounded Matches (${matchedRecipes.length})`}
            </h3>

            {matchingLoading ? (
              <div className="py-16 text-center text-zinc-400 text-sm">
                Calculating ingredient coverage...
              </div>
            ) : matchedRecipes.length === 0 ? (
              <div className="py-16 text-center bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-zinc-400 text-sm">
                No recipes matched. Add more pantry staples like eggs, rice, spinach, or onions.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchedRecipes.map((match) => (
                  <div
                    key={match.id}
                    className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={match.imageUrl}
                            alt={match.title}
                            onError={onImageError}
                            className="w-16 h-16 rounded-2xl object-cover shrink-0"
                          />
                          <div>
                            <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">
                              {match.cuisine} • {match.mealType}
                            </span>
                            <h4 className="text-sm font-bold text-white leading-snug">{match.title}</h4>
                            <span className="text-xs text-zinc-400">
                              {match.calories} kcal • {match.protein}g protein
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                          {match.matchPercentage}% Match
                        </span>
                      </div>

                      {/* Matching ingredients */}
                      <div className="space-y-1.5 text-xs bg-zinc-950 p-3 rounded-2xl border border-zinc-800/80">
                        <p className="text-emerald-400 text-[11px] font-semibold">
                          ✓ In Your Pantry: {match.matchingIngredients.join(", ")}
                        </p>
                        {match.missingIngredients && match.missingIngredients.length > 0 && (
                          <div className="text-zinc-400 text-[11px]">
                            <span className="text-zinc-400 font-medium">Missing: </span>
                            <span>
                              {match.missingIngredients
                                .map((mi) => `${mi.amount} ${mi.unit} ${mi.name}`)
                                .join(", ")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setActiveMeal(match)}
                        className="text-emerald-400 font-bold hover:underline"
                      >
                        View Full Recipe
                      </button>

                      <div className="flex items-center gap-2">
                        {match.missingIngredients && match.missingIngredients.length > 0 && (
                          <button
                            type="button"
                            disabled={addingGrocery === match.id}
                            onClick={() => handleAddMissingToGrocery(match)}
                            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold flex items-center gap-1.5 transition-colors border border-zinc-700"
                          >
                            <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
                            <span>
                              {addingGrocery === match.id ? "Adding..." : "+ Missing to Groceries"}
                            </span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleAddToPlan(match, match.mealType || "dinner")}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold"
                        >
                          + Add to Plan
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Recipe Modal */}
      {activeMeal && (
        <MealModal
          meal={activeMeal}
          onClose={() => setActiveMeal(null)}
          onMealPlanned={() => showToast(`Added "${activeMeal.title}" to your Weekly Plan!`)}
          onMealLogged={() => showToast(`Logged "${activeMeal.title}" to today's diary!`)}
        />
      )}
    </div>
  );
};

export default AIAssistantPage;
