// Integration tests against the real Express app + real (local SQLite)
// database — spins up `app` on an ephemeral port and hits real HTTP
// routes. Every test creates its own throwaway user(s) and cleans them
// up in `after()`, so the seeded demo account/data are never touched.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import "dotenv/config";
import prisma from "./config/prisma.js";

process.env.NODE_ENV = "test";
const { app } = await import("./app.js");

const server = createServer(app);
await new Promise((resolve) => server.listen(0, resolve));
const BASE = `http://localhost:${server.address().port}/api`;

const createdUserIds = [];

async function registerUser(email) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "correct-horse-battery-staple", name: "Test User" }),
  });
  const body = await res.json();
  if (body?.user?.id) createdUserIds.push(body.user.id);
  return { status: res.status, body };
}

function authed(token, options = {}) {
  return {
    ...options,
    headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), Authorization: `Bearer ${token}` },
  };
}

let userA, tokenA, userB, tokenB;

test.before(async () => {
  const a = await registerUser(`__test_user_a_${Date.now()}__@example.com`);
  const b = await registerUser(`__test_user_b_${Date.now()}__@example.com`);
  userA = a.body.user;
  tokenA = a.body.token;
  userB = b.body.user;
  tokenB = b.body.token;
});

// ---------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------

test("register rejects a missing password", async () => {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "__test_nopw__@example.com", name: "X" }),
  });
  assert.equal(res.status, 400);
});

test("register rejects a duplicate email", async () => {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: userA.email, password: "correct-horse-battery-staple", name: "Dup" }),
  });
  assert.equal(res.status, 400);
});

test("login with correct credentials succeeds and returns a token", async () => {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: userA.email, password: "correct-horse-battery-staple" }),
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(body.token);
});

test("login with wrong password fails", async () => {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: userA.email, password: "totally-wrong" }),
  });
  assert.equal(res.status, 401);
});

// ---------------------------------------------------------------------
// Protected routes reject unauthenticated callers
// ---------------------------------------------------------------------

for (const [method, path] of [
  ["GET", "/profile"],
  ["GET", "/meal-plans/current"],
  ["GET", "/tracker/today"],
  ["GET", "/grocery"],
  ["GET", "/favorites"],
  ["POST", "/ai/assistant"],
]) {
  test(`${method} ${path} with no token returns 401`, async () => {
    const res = await fetch(`${BASE}${path}`, { method });
    assert.equal(res.status, 401);
  });
}

// ---------------------------------------------------------------------
// Authorization: User A cannot touch User B's resources
// ---------------------------------------------------------------------

async function getOrCreateThisWeekPlanId(token) {
  const res = await fetch(`${BASE}/meal-plans/current`, authed(token));
  const body = await res.json();
  return body.mealPlanId;
}

async function getAnyMealId() {
  const res = await fetch(`${BASE}/meals?maxCalories=9999`);
  const body = await res.json();
  return body.meals[0].id;
}

test("user A cannot swap a meal into user B's planned-meal slot", async () => {
  await getOrCreateThisWeekPlanId(tokenB); // ensure B has a plan
  const mealId = await getAnyMealId();

  const planRes = await fetch(
    `${BASE}/meal-plans/plan-meal`,
    authed(tokenB, { method: "POST", body: JSON.stringify({ mealId, dayOfWeek: "mon", slot: "lunch" }) })
  );
  const { plannedMeal } = await planRes.json();

  const swapRes = await fetch(
    `${BASE}/meal-plans/swap-meal`,
    authed(tokenA, { method: "PUT", body: JSON.stringify({ plannedMealId: plannedMeal.id, newMealId: mealId }) })
  );
  assert.equal(swapRes.status, 404, "user A must not be able to swap user B's planned meal");
});

test("user A cannot delete user B's planned meal", async () => {
  const mealId = await getAnyMealId();
  const planRes = await fetch(
    `${BASE}/meal-plans/plan-meal`,
    authed(tokenB, { method: "POST", body: JSON.stringify({ mealId, dayOfWeek: "tue", slot: "dinner" }) })
  );
  const { plannedMeal } = await planRes.json();

  const delRes = await fetch(`${BASE}/meal-plans/planned-meal/${plannedMeal.id}`, authed(tokenA, { method: "DELETE" }));
  assert.equal(delRes.status, 404);

  // Confirm it's genuinely still there, not silently deleted.
  const stillThere = await prisma.plannedMeal.findUnique({ where: { id: plannedMeal.id } });
  assert.ok(stillThere, "user B's planned meal must still exist after user A's failed delete");
});

test("user A cannot mark user B's planned meal complete", async () => {
  const mealId = await getAnyMealId();
  const planRes = await fetch(
    `${BASE}/meal-plans/plan-meal`,
    authed(tokenB, { method: "POST", body: JSON.stringify({ mealId, dayOfWeek: "wed", slot: "breakfast" }) })
  );
  const { plannedMeal } = await planRes.json();

  const completeRes = await fetch(
    `${BASE}/meal-plans/planned-meal/${plannedMeal.id}/complete`,
    authed(tokenA, { method: "PATCH", body: JSON.stringify({ isCompleted: true }) })
  );
  assert.equal(completeRes.status, 404);

  const stillIncomplete = await prisma.plannedMeal.findUnique({ where: { id: plannedMeal.id } });
  assert.equal(stillIncomplete.isCompleted, false, "user A's forbidden request must not have flipped the flag");
});

test("user A's tracker, favorites, and grocery list never include user B's data", async () => {
  const mealId = await getAnyMealId();

  // B logs a meal, favorites a meal, and adds a grocery item.
  await fetch(`${BASE}/tracker/log-meal`, authed(tokenB, { method: "POST", body: JSON.stringify({ mealId, slot: "lunch", servings: 1 }) }));
  await fetch(`${BASE}/favorites/${mealId}/toggle`, authed(tokenB, { method: "POST" }));
  await fetch(
    `${BASE}/grocery/add-items`,
    authed(tokenB, { method: "POST", body: JSON.stringify({ items: [{ name: "__test_item__", amount: 1, unit: "pc" }] }) })
  );

  const [trackerA, favoritesA, groceryA] = await Promise.all([
    fetch(`${BASE}/tracker/today`, authed(tokenA)).then((r) => r.json()),
    fetch(`${BASE}/favorites`, authed(tokenA)).then((r) => r.json()),
    fetch(`${BASE}/grocery`, authed(tokenA)).then((r) => r.json()),
  ]);

  assert.equal(trackerA.logsCount, 0, "user A's tracker must not show user B's logged meal");
  assert.equal(favoritesA.favorites.length, 0, "user A must not see user B's favorite");
  assert.equal(groceryA.totalItems, 0, "user A must not see user B's grocery item");
});

test("user B can see their own logged data (sanity check the isolation test isn't vacuous)", async () => {
  const trackerB = await fetch(`${BASE}/tracker/today`, authed(tokenB)).then((r) => r.json());
  assert.ok(trackerB.logsCount >= 1, "user B should see their own earlier log");
});

test.after(async () => {
  // Cascade-clean everything created by the two test users.
  for (const id of createdUserIds) {
    await prisma.groceryItem.deleteMany({ where: { userId: id } });
    await prisma.favorite.deleteMany({ where: { userId: id } });
    await prisma.mealLog.deleteMany({ where: { userId: id } });
    await prisma.waterLog.deleteMany({ where: { userId: id } });
    const plans = await prisma.mealPlan.findMany({ where: { userId: id } });
    for (const p of plans) {
      await prisma.plannedMeal.deleteMany({ where: { mealPlanId: p.id } });
    }
    await prisma.mealPlan.deleteMany({ where: { userId: id } });
    await prisma.profile.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } }).catch(() => {});
  }
  server.close();
  await prisma.$disconnect();
});
