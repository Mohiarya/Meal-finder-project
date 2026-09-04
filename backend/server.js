import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import mealsRoutes from "./routes/meals.js";
import mealPlansRoutes from "./routes/mealPlans.js";
import trackerRoutes from "./routes/tracker.js";
import groceryRoutes from "./routes/grocery.js";
import favoritesRoutes from "./routes/favorites.js";
import aiRoutes from "./routes/ai.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Meal Finder Nutrition API",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/meals", mealsRoutes);
app.use("/api/meal-plans", mealPlansRoutes);
app.use("/api/tracker", trackerRoutes);
app.use("/api/grocery", groceryRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/ai", aiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Not Found: ${req.method} ${req.url}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global Server Error:", err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`🚀 Meal Finder Backend API running on http://localhost:${PORT}`);
});
