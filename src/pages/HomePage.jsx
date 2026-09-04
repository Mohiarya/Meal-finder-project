import React from "react";
import { Link } from "react-router-dom";
import {
  ChefHat,
  Sparkles,
  ArrowRight,
  UtensilsCrossed,
  CalendarDays,
  Activity,
  ShoppingCart,
  CheckCircle2,
  ShieldCheck,
  Flame,
  Dumbbell,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Dashboard from "./Dashboard";

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  // If logged in, seamlessly display the full personalized Dashboard!
  if (isAuthenticated) {
    return <Dashboard />;
  }

  // Otherwise show the landing experience
  return (
    <div className="space-y-16 py-12">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Nutrition Architecture</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
          The Intelligent Nutrition Platform That Adapts To Your Life.
        </h1>

        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Discover gourmet recipes, dynamically scale macro targets, build automated weekly meal plans,
          and track real-time calories powered by verified data.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/register"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-sm shadow-xl shadow-emerald-500/20 transition-all hover:scale-105"
          >
            <span>Start Free Calibration</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-bold text-sm transition-all"
          >
            <span>Explore Demo Account</span>
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Dynamic Macro Scaler</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Adjust portions from 1 to 6 servings. Calories, protein, and ingredient weights scale dynamically in real time.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <CalendarDays className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">7-Day Meal Architecture</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Plan breakfast, lunch, and dinner. Duplicate days with one click, swap comparable meals, and sync your grocery list.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">AI Culinary Assistant</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Ask natural questions grounded strictly in verified nutritional truth. Cook with whatever is currently in your fridge.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;