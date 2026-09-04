import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { authenticateToken } from "../middleware/auth.js";
import { calculateNutritionTargets } from "../utils/nutritionCalculator.js";
import { getJwtSecret, JWT_EXPIRY } from "../config/jwt.js";
import { authLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

// Helper to sign JWT
function generateToken(userId) {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: JWT_EXPIRY });
}

// POST /api/auth/register
router.post("/register", authLimiter, async (req, res) => {
  try {
    const { email, password, name, age, gender, weight, height, goal, dietPreference } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const targets = calculateNutritionTargets({
      age: age ? Number(age) : 25,
      gender: gender || "male",
      weight: weight ? Number(weight) : 70,
      height: height ? Number(height) : 175,
      goal: goal || "healthy_eating",
      dietPreference: dietPreference || "omnivore",
    });

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        passwordHash,
        profile: {
          create: {
            age: age ? Number(age) : 25,
            gender: gender || "male",
            weight: weight ? Number(weight) : 70,
            height: height ? Number(height) : 175,
            goal: goal || "healthy_eating",
            dietPreference: dietPreference || "omnivore",
            ...targets,
          },
        },
      },
      include: { profile: true },
    });

    const token = generateToken(user.id);
    const { passwordHash: _, ...safeUser } = user;

    res.status(201).json({
      message: "Registration successful",
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// POST /api/auth/login
router.post("/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { profile: true },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user.id);
    const { passwordHash: _, ...safeUser } = user;

    res.json({
      message: "Login successful",
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});

// GET /api/auth/me
router.get("/me", authenticateToken, async (req, res) => {
  const { passwordHash: _, ...safeUser } = req.user;
  res.json({ user: safeUser });
});

export default router;
