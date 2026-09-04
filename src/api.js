const API_BASE = "http://localhost:5050/api";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}: Failed to execute request`);
  }

  return data;
}

export const api = {
  // Auth
  register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  getMe: () => request("/auth/me"),

  // Profile
  getProfile: () => request("/profile"),
  updateProfile: (body) => request("/profile", { method: "PUT", body: JSON.stringify(body) }),

  // Meals
  getMeals: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== "" && v !== null)
    ).toString();
    return request(`/meals${qs ? `?${qs}` : ""}`);
  },
  getMealDetails: (id, userId) => request(`/meals/${id}${userId ? `?userId=${userId}` : ""}`),
  getSwapOptions: (id, filter = "") => request(`/meals/${id}/swap-options${filter ? `?filter=${filter}` : ""}`),

  // Meal Planner
  getCurrentPlan: (weekStartDate) => request(`/meal-plans/current${weekStartDate ? `?weekStartDate=${weekStartDate}` : ""}`),
  planMeal: (body) => request("/meal-plans/plan-meal", { method: "POST", body: JSON.stringify(body) }),
  swapMeal: (body) => request("/meal-plans/swap-meal", { method: "PUT", body: JSON.stringify(body) }),
  removePlannedMeal: (id) => request(`/meal-plans/planned-meal/${id}`, { method: "DELETE" }),
  togglePlannedMealComplete: (id, isCompleted) =>
    request(`/meal-plans/planned-meal/${id}/complete`, {
      method: "PATCH",
      body: JSON.stringify({ isCompleted }),
    }),
  duplicateDay: (body) => request("/meal-plans/duplicate-day", { method: "POST", body: JSON.stringify(body) }),

  // Tracker & Analytics
  getTodayTracker: (date) => request(`/tracker/today${date ? `?date=${date}` : ""}`),
  logMeal: (body) => request("/tracker/log-meal", { method: "POST", body: JSON.stringify(body) }),
  deleteMealLog: (id) => request(`/tracker/log-meal/${id}`, { method: "DELETE" }),
  logWater: (body) => request("/tracker/water", { method: "POST", body: JSON.stringify(body) }),
  getWeeklyAnalytics: () => request("/tracker/analytics/weekly"),

  // Grocery
  getGroceryList: (weekStartDate) => request(`/grocery${weekStartDate ? `?weekStartDate=${weekStartDate}` : ""}`),
  toggleGroceryItem: (body) => request("/grocery/toggle", { method: "POST", body: JSON.stringify(body) }),
  clearCheckedGrocery: (body) => request("/grocery/clear-checked", { method: "POST", body: JSON.stringify(body) }),
  addGroceryItems: (items, weekStartDate) =>
    request("/grocery/add-items", { method: "POST", body: JSON.stringify({ items, weekStartDate }) }),

  // Favorites
  getFavorites: () => request("/favorites"),
  toggleFavorite: (mealId) => request(`/favorites/${mealId}/toggle`, { method: "POST" }),

  // AI
  askAssistant: (prompt) => request("/ai/assistant", { method: "POST", body: JSON.stringify({ prompt }) }),
  cookWithIngredients: (ingredients) =>
    request("/ai/cook-with-ingredients", { method: "POST", body: JSON.stringify({ ingredients }) }),
  getQuickCopilotRecommendation: () => request("/ai/quick-copilot-recommendation"),
};

export default api;
