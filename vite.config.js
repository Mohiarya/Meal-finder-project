import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3002,
    open: false,
    proxy: {
      "/api": {
        target: "http://localhost:5050",
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    globals: true,
    // The backend has its own, separate test runner (`node --test`,
    // run from inside backend/) — Vitest here is scoped to the frontend
    // only, so it doesn't try to bundle backend/'s node:test imports.
    include: ["src/**/*.test.{js,jsx}"],
  },
});
