import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const secret = process.env.JWT_SECRET || "meal-finder-jwt-secret-key-prod-grade-2026";
    const decoded = jwt.verify(token, secret);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { profile: true },
    });

    if (!user) {
      return res.status(401).json({ error: "User not found or token invalid" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};
