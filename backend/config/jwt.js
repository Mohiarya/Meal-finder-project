// Single source of truth for the session-token secret. No hardcoded
// fallback — a missing JWT_SECRET is a deployment misconfiguration, not
// something to silently paper over with a default that ends up committed
// to a public repo. server.js checks this at startup so the process
// never even starts in a half-working state; this getter is the same
// guard for any code path that imports it directly (e.g. tests).
export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "JWT_SECRET is not set (or is too short) — refusing to sign/verify tokens without a real secret."
    );
  }
  return secret;
}

export const JWT_EXPIRY = "30d";
