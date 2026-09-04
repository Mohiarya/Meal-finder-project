import rateLimit from "express-rate-limit";

// Registration/login do real bcrypt work (intentionally slow) and are
// unauthenticated by definition — worth capping per IP so they can't be
// used to hammer the database or brute-force a password.
export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts — please wait a few minutes and try again." },
});

// AI endpoints are the only ones that can ever spend real money (once a
// real OpenAI key is configured) — capped tighter than plain CRUD routes.
export const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many AI requests — please wait a few minutes and try again." },
});
