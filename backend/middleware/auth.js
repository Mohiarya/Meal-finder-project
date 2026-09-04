import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { getJwtSecret } from "../config/jwt.js";

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    
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

// For routes that are meant to work for anyone (public meal browsing) but
// personalize their response *if* the caller happens to be logged in
// (e.g. marking favorites). Never trusts a client-supplied user id for
// this — only ever a token this server itself issued. A missing or
// invalid token simply means req.user stays unset; it never rejects the
// request the way authenticateToken does.
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (user) req.user = user;
  } catch {
    // Invalid/expired token on an optional-auth route: treat as anonymous
    // rather than erroring — the route still works, just without personalization.
  }
  next();
};
