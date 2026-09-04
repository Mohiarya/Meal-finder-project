import { PrismaClient } from "@prisma/client";
import { allSeedRecipes } from "./recipes/index.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // Clean old data
  await prisma.groceryItem.deleteMany();
  await prisma.waterLog.deleteMany();
  await prisma.mealLog.deleteMany();
  await prisma.plannedMeal.deleteMany();
  await prisma.mealPlan.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.mealIngredient.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.meal.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // Create Demo User
  const passwordHash = await bcrypt.hash("demo12345", 10);
  const user = await prisma.user.create({
    data: {
      email: "demo@mealfinder.com",
      name: "Alex Morgan",
      passwordHash,
      profile: {
        create: {
          age: 26,
          gender: "male",
          weight: 74,
          height: 178,
          activityLevel: "moderate",
          goal: "muscle_gain",
          dietPreference: "omnivore",
          allergies: JSON.stringify([]),
          dislikedFoods: JSON.stringify(["Mushrooms"]),
          cuisines: JSON.stringify(["Mediterranean", "Asian", "Indian", "Mexican"]),
          mealsPerDay: 4,
          cookingTimePreference: 30,
          weeklyBudget: 85,
          dailyCalorieTarget: 2350,
          proteinTarget: 165,
          carbsTarget: 260,
          fatTarget: 65,
          waterTargetMl: 2600,
        },
      },
    },
    include: { profile: true },
  });

  console.log(`Created default demo user: ${user.email}`);

  // Seed Ingredients & Meals
  for (const mealData of allSeedRecipes) {
    const meal = await prisma.meal.create({
      data: {
        title: mealData.title,
        description: mealData.description,
        imageUrl: mealData.imageUrl,
        calories: mealData.calories,
        protein: mealData.protein,
        carbs: mealData.carbs,
        fat: mealData.fat,
        prepTimeMinutes: mealData.prepTimeMinutes,
        cookTimeMinutes: mealData.cookTimeMinutes,
        servings: mealData.servings,
        difficulty: mealData.difficulty,
        mealType: mealData.mealType,
        cuisine: mealData.cuisine,
        dietaryTags: JSON.stringify(mealData.dietaryTags),
        instructions: JSON.stringify(mealData.instructions),
      },
    });

    for (const ing of mealData.ingredients) {
      let ingredient = await prisma.ingredient.findUnique({
        where: { name: ing.name },
      });

      if (!ingredient) {
        ingredient = await prisma.ingredient.create({
          data: {
            name: ing.name,
            category: ing.category,
          },
        });
      }

      await prisma.mealIngredient.create({
        data: {
          mealId: meal.id,
          ingredientId: ingredient.id,
          amount: ing.amount,
          unit: ing.unit,
        },
      });
    }
  }

  console.log(`Seeded ${allSeedRecipes.length} gourmet meals with ingredients!`);

  // Seed a sample weekly plan for Demo User
  const allMeals = await prisma.meal.findMany();
  const breakfastMeals = allMeals.filter((m) => m.mealType === "breakfast");
  const lunchMeals = allMeals.filter((m) => m.mealType === "lunch");
  const dinnerMeals = allMeals.filter((m) => m.mealType === "dinner");
  const snackMeals = allMeals.filter((m) => m.mealType === "snack");

  const today = new Date();
  const day = today.getDay(); // 0 is Sun, 1 is Mon
  const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(today.setDate(diff));
  const mondayIso = monday.toISOString().split("T")[0];

  const mealPlan = await prisma.mealPlan.create({
    data: {
      userId: user.id,
      weekStartDate: mondayIso,
    },
  });

  const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  for (let i = 0; i < days.length; i++) {
    const d = days[i];
    if (breakfastMeals[i % breakfastMeals.length]) {
      await prisma.plannedMeal.create({
        data: {
          mealPlanId: mealPlan.id,
          mealId: breakfastMeals[i % breakfastMeals.length].id,
          dayOfWeek: d,
          slot: "breakfast",
          servings: 1,
          isCompleted: i === 0, // mark Monday breakfast completed
        },
      });
    }
    if (lunchMeals[i % lunchMeals.length]) {
      await prisma.plannedMeal.create({
        data: {
          mealPlanId: mealPlan.id,
          mealId: lunchMeals[i % lunchMeals.length].id,
          dayOfWeek: d,
          slot: "lunch",
          servings: 1,
          isCompleted: false,
        },
      });
    }
    if (dinnerMeals[i % dinnerMeals.length]) {
      await prisma.plannedMeal.create({
        data: {
          mealPlanId: mealPlan.id,
          mealId: dinnerMeals[i % dinnerMeals.length].id,
          dayOfWeek: d,
          slot: "dinner",
          servings: 1,
          isCompleted: false,
        },
      });
    }
    if (snackMeals[i % snackMeals.length]) {
      await prisma.plannedMeal.create({
        data: {
          mealPlanId: mealPlan.id,
          mealId: snackMeals[i % snackMeals.length].id,
          dayOfWeek: d,
          slot: "snack",
          servings: 1,
          isCompleted: false,
        },
      });
    }
  }

  // Seed sample logs for today
  const todayIso = new Date().toISOString().split("T")[0];
  const firstBreakfast = breakfastMeals[0];
  if (firstBreakfast) {
    await prisma.mealLog.create({
      data: {
        userId: user.id,
        mealId: firstBreakfast.id,
        mealTitle: firstBreakfast.title,
        slot: "breakfast",
        date: todayIso,
        calories: firstBreakfast.calories,
        protein: firstBreakfast.protein,
        carbs: firstBreakfast.carbs,
        fat: firstBreakfast.fat,
        servings: 1,
      },
    });
  }

  // Seed sample water log
  await prisma.waterLog.create({
    data: {
      userId: user.id,
      date: todayIso,
      amountMl: 1250,
    },
  });

  // Seed sample favorite
  if (lunchMeals[0]) {
    await prisma.favorite.create({
      data: {
        userId: user.id,
        mealId: lunchMeals[0].id,
      },
    });
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
