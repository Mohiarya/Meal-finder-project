import React, { useState, useEffect } from "react";
import {
  User,
  Activity,
  Flame,
  Dumbbell,
  Droplets,
  Save,
  Check,
  Sparkles,
  ShieldCheck,
  Heart,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api";

const ProfilePage = () => {
  const { user, profile, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    age: profile?.age || 25,
    gender: profile?.gender || "male",
    weight: profile?.weight || 70,
    height: profile?.height || 175,
    activityLevel: profile?.activityLevel || "moderate",
    goal: profile?.goal || "healthy_eating",
    dietPreference: profile?.dietPreference || "omnivore",
    mealsPerDay: profile?.mealsPerDay || 3,
    cookingTimePreference: profile?.cookingTimePreference || 30,
    weeklyBudget: profile?.weeklyBudget || 75,
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (user && profile) {
      setFormData({
        name: user.name || "",
        age: profile.age || 25,
        gender: profile.gender || "male",
        weight: profile.weight || 70,
        height: profile.height || 175,
        activityLevel: profile.activityLevel || "moderate",
        goal: profile.goal || "healthy_eating",
        dietPreference: profile.dietPreference || "omnivore",
        mealsPerDay: profile.mealsPerDay || 3,
        cookingTimePreference: profile.cookingTimePreference || 30,
        weeklyBudget: profile.weeklyBudget || 75,
      });
    }

    const loadFavorites = async () => {
      try {
        const res = await api.getFavorites();
        setFavorites(res.favorites || []);
      } catch (err) {
        console.error("Failed to load favorites:", err);
      }
    };
    loadFavorites();
  }, [user, profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateProfile({
        ...formData,
        autoRecalculateTargets: true,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const dietOptions = [
    { label: "Omnivore", value: "omnivore" },
    { label: "Vegetarian", value: "vegetarian" },
    { label: "Vegan", value: "vegan" },
    { label: "Pescatarian", value: "pescatarian" },
    { label: "Keto", value: "keto" },
    { label: "Paleo", value: "paleo" },
  ];

  const goalOptions = [
    { label: "Healthy Eating & Wellness", value: "healthy_eating" },
    { label: "Weight Loss / Fat Burn", value: "weight_loss" },
    { label: "Muscle Gain / Hypertrophy", value: "muscle_gain" },
    { label: "Maintenance & Longevity", value: "maintenance" },
  ];

  const activityOptions = [
    { label: "Sedentary (Desk Job)", value: "sedentary" },
    { label: "Light Activity (1-2x/week)", value: "light" },
    { label: "Moderate Exercise (3-4x/week)", value: "moderate" },
    { label: "Active Athlete (5-6x/week)", value: "active" },
    { label: "Very Active / Physical Labor", value: "very_active" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <User className="w-7 h-7 text-emerald-400" />
          <span>Profile & Personalized Nutrition Targets</span>
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Adjust your biometrics and lifestyle preferences to update your daily macro targets.
        </p>
      </div>

      {/* Target Preview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] text-zinc-400 block mb-1">Calories</span>
          <span className="text-xl font-black text-orange-400">
            {profile?.dailyCalorieTarget || 2000}
          </span>
          <span className="text-[10px] text-zinc-500 block">kcal/day</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] text-zinc-400 block mb-1">Protein</span>
          <span className="text-xl font-black text-indigo-400">
            {profile?.proteinTarget || 120}g
          </span>
          <span className="text-[10px] text-zinc-500 block">target</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] text-zinc-400 block mb-1">Carbs</span>
          <span className="text-xl font-black text-amber-400">
            {profile?.carbsTarget || 220}g
          </span>
          <span className="text-[10px] text-zinc-500 block">target</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] text-zinc-400 block mb-1">Fat</span>
          <span className="text-xl font-black text-sky-400">
            {profile?.fatTarget || 65}g
          </span>
          <span className="text-[10px] text-zinc-500 block">target</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center col-span-2 sm:col-span-1">
          <span className="text-[11px] text-zinc-400 block mb-1">Water Goal</span>
          <span className="text-xl font-black text-cyan-400">
            {((profile?.waterTargetMl || 2500) / 1000).toFixed(1)}L
          </span>
          <span className="text-[10px] text-zinc-500 block">per day</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="text-base font-bold text-white border-b border-zinc-800 pb-3">
          Personal Physical Attributes
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other / Prefer not to say</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Age</label>
            <input
              type="number"
              required
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Weight (kg)</label>
            <input
              type="number"
              required
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Height (cm)</label>
            <input
              type="number"
              required
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Activity Level</label>
            <select
              value={formData.activityLevel}
              onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
            >
              {activityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <h3 className="text-base font-bold text-white border-b border-zinc-800 pb-3 pt-4">
          Diet & Health Objectives
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Primary Fitness Goal</label>
            <select
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
            >
              {goalOptions.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Dietary Philosophy</label>
            <select
              value={formData.dietPreference}
              onChange={(e) => setFormData({ ...formData, dietPreference: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
            >
              {dietOptions.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between">
          {success && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>Profile and nutrition targets updated successfully!</span>
            </span>
          )}
          <div className="ml-auto">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Calculating & Saving..." : "Save & Recalculate"}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Bookmarked Favorites Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
          <span>Your Bookmarked Favorites ({favorites.length})</span>
        </h3>

        {favorites.length === 0 ? (
          <p className="text-xs text-zinc-500">
            You haven't bookmarked any meals yet. Click the heart icon on any meal to save it here!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center gap-3"
              >
                <img
                  src={fav.imageUrl}
                  alt={fav.title}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{fav.title}</h4>
                  <span className="text-[11px] text-zinc-400">
                    {fav.calories} kcal • {fav.protein}g protein
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
