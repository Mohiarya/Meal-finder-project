import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Flame,
  Dumbbell,
  Droplets,
  Check,
  ChefHat,
  Target,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const OnboardingPage = () => {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    goal: "healthy_eating",
    dietPreference: "omnivore",
    age: 25,
    gender: "male",
    weight: 70,
    height: 175,
    activityLevel: "moderate",
    cookingTimePreference: 30,
    weeklyBudget: 75,
  });

  const goals = [
    {
      id: "weight_loss",
      title: "Fat Loss & Definition",
      desc: "Calorie deficit with elevated protein to preserve lean muscle mass.",
      icon: "🔥",
    },
    {
      id: "muscle_gain",
      title: "Muscle Gain & Strength",
      desc: "Nutrient-dense calorie surplus prioritizing high-protein foods.",
      icon: "💪",
    },
    {
      id: "healthy_eating",
      title: "Clean Eating & Energy",
      desc: "Balanced Mediterranean-style whole foods for maximum daily vitality.",
      icon: "🥗",
    },
    {
      id: "maintenance",
      title: "Weight Maintenance",
      desc: "Equilibrium calories to sustain current weight and health markers.",
      icon: "⚖️",
    },
  ];

  const diets = [
    { id: "omnivore", title: "Omnivore", desc: "All food groups including poultry, fish, and greens" },
    { id: "vegetarian", title: "Vegetarian", desc: "Plant-based with dairy and eggs, no meat or fish" },
    { id: "vegan", title: "Vegan", desc: "100% plant-exclusive foods, zero animal products" },
    { id: "pescatarian", title: "Pescatarian", desc: "Vegetarian baseline supplemented with seafood" },
    { id: "keto", title: "Ketogenic", desc: "High healthy fats, moderate protein, very low carbs (<5%)" },
  ];

  // Live Mifflin-St Jeor calculation
  const weight = Number(formData.weight) || 70;
  const height = Number(formData.height) || 175;
  const age = Number(formData.age) || 25;
  let bmr = formData.gender === "female"
    ? 10 * weight + 6.25 * height - 5 * age - 161
    : 10 * weight + 6.25 * height - 5 * age + 5;

  const mults = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
  let tdee = Math.round(bmr * (mults[formData.activityLevel] || 1.55));
  if (formData.goal === "weight_loss") tdee = Math.max(1200, tdee - 450);
  if (formData.goal === "muscle_gain") tdee += 350;

  const protGrams = Math.round((tdee * (formData.goal === "muscle_gain" ? 0.3 : 0.25)) / 4);
  const waterLiters = (weight * 0.035).toFixed(1);

  const handleFinish = async () => {
    try {
      await updateProfile(formData);
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative">
        {/* Header step counter */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              {step}/3
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                Personalized Onboarding
              </span>
              <h2 className="text-lg font-bold text-white">
                {step === 1 && "What is your main nutrition objective?"}
                {step === 2 && "Select your dietary preference"}
                {step === 3 && "Your biometric calibration"}
              </h2>
            </div>
          </div>
        </div>

        {/* Step 1: Goal */}
        {step === 1 && (
          <div className="space-y-3">
            {goals.map((g) => (
              <div
                key={g.id}
                onClick={() => setFormData({ ...formData, goal: g.id })}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                  formData.goal === g.id
                    ? "bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/10"
                    : "bg-zinc-950/80 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                }`}
              >
                <span className="text-2xl">{g.icon}</span>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white">{g.title}</h4>
                  <p className="text-xs text-zinc-400">{g.desc}</p>
                </div>
                {formData.goal === g.id && <Check className="w-5 h-5 text-emerald-400 shrink-0" />}
              </div>
            ))}
          </div>
        )}

        {/* Step 2: Diet Style */}
        {step === 2 && (
          <div className="space-y-3">
            {diets.map((d) => (
              <div
                key={d.id}
                onClick={() => setFormData({ ...formData, dietPreference: d.id })}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  formData.dietPreference === d.id
                    ? "bg-emerald-500/10 border-emerald-500 text-white"
                    : "bg-zinc-950/80 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                }`}
              >
                <div>
                  <h4 className="text-sm font-bold text-white">{d.title}</h4>
                  <p className="text-xs text-zinc-400">{d.desc}</p>
                </div>
                {formData.dietPreference === d.id && (
                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Biometrics & Target Live Preview */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Daily Activity Level</label>
              <select
                value={formData.activityLevel}
                onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200"
              >
                <option value="sedentary">Sedentary (Desk Job)</option>
                <option value="light">Light Activity (1-2x/wk)</option>
                <option value="moderate">Moderate Exercise (3-4x/wk)</option>
                <option value="active">Active Athlete (5-6x/wk)</option>
                <option value="very_active">Very Active (Heavy training)</option>
              </select>
            </div>

            {/* Calculated Plan Preview */}
            <div className="bg-zinc-950 border border-emerald-500/30 rounded-2xl p-4 text-center">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                Calculated Targets (Mifflin-St Jeor)
              </span>
              <div className="flex items-center justify-center gap-6 my-2">
                <div>
                  <span className="text-2xl font-black text-white">{tdee}</span>
                  <span className="text-[10px] text-zinc-400 block">kcal/day</span>
                </div>
                <div>
                  <span className="text-2xl font-black text-indigo-400">{protGrams}g</span>
                  <span className="text-[10px] text-zinc-400 block">protein/day</span>
                </div>
                <div>
                  <span className="text-2xl font-black text-cyan-400">{waterLiters}L</span>
                  <span className="text-[10px] text-zinc-400 block">water/day</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="pt-6 mt-6 border-t border-zinc-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md shadow-emerald-500/20"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch My Nutrition Platform</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
