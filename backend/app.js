import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import mealsRoutes from "./routes/meals.js";
import mealPlansRoutes from "./routes/mealPlans.js";
import trackerRoutes from "./routes/tracker.js";
import groceryRoutes from "./routes/grocery.js";
import favoritesRoutes from "./routes/favorites.js";
import aiRoutes from "./routes/ai.js";

// The Express app, separate from server.js's startup checks and
// .listen() call — this is what lets tests import `app` and exercise
// real routes on an ephemeral port without a real server process.

// CORS: only real, known origins may call this API from a browser.
// CLIENT_ORIGIN is the deployed frontend's URL in production; local dev
// ports are always allowed so `npm run dev` needs no extra setup. This is
// deliberately NOT origin: "*" — the JWT lives in the browser and is sent
// as a Bearer token, so an open CORS policy would let any site that can
// get a copy of a user's token (e.g. via XSS elsewhere) replay it here.
const allowedOrigins = [
  "http://localhost:3002",
  "http://localhost:5173",
  process.env.CLIENT_ORIGIN,
].filter(Boolean);

export const app = express();

app.use(
  cors({
    origin(origin, callback) {
      // No Origin header = server-to-server/curl/health checks, always fine.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
app.use(express.json());
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

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

// Global error handler — CORS rejections and anything unexpected land
// here; never leak a stack trace or raw error message to the client.
app.use((err, req, res, next) => {
  console.error("Global Server Error:", err);
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "Origin not allowed" });
  }
  res.status(500).json({ error: "Internal server error" });
});
