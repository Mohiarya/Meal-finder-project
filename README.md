# Meal Finder & AI Nutrition Platform 🥗⚡

A modern, full-stack, AI-powered nutrition and meal planning platform featuring a curated gourmet recipe catalog, deterministic macro-aware recommendation engine, weekly meal planner, live macro tracking, and consolidated smart grocery lists.

---

## 🌟 Key Features

1. **AI Nutrition Copilot** (`/ai`):
   - Multi-constraint semantic query extraction (calories, protein, meal slots, dietary restrictions, allergens).
   - Deterministic protein-to-calorie density scoring ($P / (kcal/100)$).
   - Zero-hallucination guarantee: macros, ingredients, and instructions are queried directly from the SQLite database.
   - **Cook With What I Have**: Pantry ingredient matching with 1-click sync to your consolidated grocery list.
2. **Gourmet Recipe Catalog** (`/meals`):
   - **110 chef-curated recipes** across 10 authentic cuisines (Indian, Mediterranean, Italian, Mexican, American, Japanese, Korean, Thai, Middle Eastern, Asian Fusion).
   - Filter by meal type, dietary preferences (Vegan, Vegetarian, Pescatarian, Keto, Low-Calorie, High-Protein), calories, and protein.
   - Dynamic sorting (*Lowest Calories*, *Highest Calories*, *Highest Protein Density*, *Fastest Prep*) and responsive 18-recipe pagination.
   - Interactive recipe modal with dynamic serving size scaling.
3. **Weekly Meal Planner** (`/planner`):
   - Interactive 7-day grid (Monday to Sunday) across 4 daily meal slots (Breakfast, Lunch, Dinner, Snack).
   - 1-click recipe swapping with macro compatibility filtering.
   - Mark meals as completed or duplicate daily meal plans.
4. **Live Nutrition Tracker & Analytics** (`/tracker`):
   - Daily calorie, protein, carbs, and fat progress bars against personal TDEE targets.
   - Water hydration tracker.
   - Weekly macro analytics breakdown.
5. **Smart Consolidated Grocery List** (`/grocery`):
   - Automatically aggregates ingredients from your active weekly meal plan.
   - Categorized by department (Produce, Protein, Dairy, Grains, Pantry, Spices).
   - Checklist with item strike-through and 1-click clear.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** v18+
- **npm** v9+

### 2. Installation
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..
```

### 3. Database Setup & Seeding
```bash
# Generate Prisma client and seed 110 recipes + demo user
npm run seed
```

### 4. Running the Platform
Run the backend server and frontend development server in separate terminals:

```bash
# Terminal 1: Start Express Backend API (Port 5050)
npm run server

# Terminal 2: Start Vite Dev Server (Port 3002)
npm run dev -- --port 3002
```

Open **[http://localhost:3002](http://localhost:3002)** in your browser.

---

## 🔑 Demo Account Credentials

| Email | Password |
|---|---|
| `demo@mealfinder.com` | `demo12345` |

---

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React, Recharts
- **Backend**: Node.js, Express, Prisma ORM, SQLite
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing
- **AI Engine**: Deterministic Semantic Parser + Macro-Density Optimizer + Optional OpenAI GPT-4o-mini enrichment
