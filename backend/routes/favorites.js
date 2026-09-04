import express from "express";
import prisma from "../config/prisma.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET /api/favorites
router.get("/", authenticateToken, async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: {
        meal: {
          include: {
            ingredients: { include: { ingredient: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = favorites.map((f) => ({
      ...f.meal,
      dietaryTags: JSON.parse(f.meal.dietaryTags || "[]"),
      instructions: JSON.parse(f.meal.instructions || "[]"),
      isFavorite: true,
      favoritedAt: f.createdAt,
    }));

    res.json({ favorites: formatted });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

// POST /api/favorites/:mealId/toggle
router.post("/:mealId/toggle", authenticateToken, async (req, res) => {
  try {
    const { mealId } = req.params;
    const userId = req.user.id;

    const existing = await prisma.favorite.findUnique({
      where: { userId_mealId: { userId, mealId } },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      res.json({ isFavorite: false, message: "Removed from favorites" });
    } else {
      await prisma.favorite.create({
        data: { userId, mealId },
      });
      res.json({ isFavorite: true, message: "Added to favorites" });
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({ error: "Failed to toggle favorite" });
  }
});

export default router;
