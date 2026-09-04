import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Load backend/.env by absolute path, not by process.cwd() — otherwise
// `npm run server` from the repo root (as the root package.json's own
// script does) silently finds no .env and every var falls through to
// undefined, since cwd there is the root, not backend/.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

import { getJwtSecret } from "./config/jwt.js";

// Fail loudly and immediately if the session secret is missing, rather
// than starting up "successfully" and only discovering it the first time
// someone tries to log in.
try {
  getJwtSecret();
} catch (err) {
  console.error(`Startup aborted: ${err.message}`);
  console.error("Set JWT_SECRET in backend/.env (a long random string) before starting the server.");
  process.exit(1);
}

const { app } = await import("./app.js");
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Meal Finder Backend API running on http://localhost:${PORT}`);
});
