export const SEED_MEALS = [
  // Breakfasts
  {
    title: "Mediterranean Shakshuka with Feta",
    description: "Gently poached eggs in a spiced tomato, bell pepper, and garlic sauce topped with crumbled Greek feta and fresh cilantro.",
    imageUrl: "https://images.unsplash.com/photo-1590412200988-a436970781fa?w=800&auto=format&fit=crop&q=80",
    calories: 380,
    protein: 21,
    carbs: 24,
    fat: 22,
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    servings: 1,
    difficulty: "easy",
    mealType: "breakfast",
    cuisine: "Mediterranean",
    dietaryTags: ["Vegetarian", "Gluten-Free", "High-Protein"],
    instructions: [
      "Heat olive oil in a skillet over medium heat.",
      "Sauté diced onions, red bell pepper, and minced garlic until soft (approx 5 mins).",
      "Add crushed cumin, smoked paprika, chili flakes, and poured crushed tomatoes; simmer for 10 mins.",
      "Make small wells in the sauce and crack eggs directly into them.",
      "Cover with a lid and cook on low heat for 5-7 minutes until whites are set and yolks are runny.",
      "Garnish with crumbled feta and fresh cilantro before serving."
    ],
    ingredients: [
      { name: "Eggs", amount: 2, unit: "large", category: "Protein" },
      { name: "Crushed Tomatoes", amount: 200, unit: "g", category: "Pantry" },
      { name: "Red Bell Pepper", amount: 1, unit: "medium", category: "Produce" },
      { name: "Onion", amount: 0.5, unit: "medium", category: "Produce" },
      { name: "Garlic", amount: 2, unit: "cloves", category: "Produce" },
      { name: "Feta Cheese", amount: 35, unit: "g", category: "Dairy" },
      { name: "Olive Oil", amount: 10, unit: "ml", category: "Pantry" }
    ]
  },
  {
    title: "High-Protein Greek Yogurt Parfait",
    description: "Thick strained non-fat Greek yogurt layered with wild berries, raw almond butter, chia seeds, and artisan rolled oats.",
    imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&auto=format&fit=crop&q=80",
    calories: 390,
    protein: 34,
    carbs: 42,
    fat: 10,
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    servings: 1,
    difficulty: "easy",
    mealType: "breakfast",
    cuisine: "American",
    dietaryTags: ["Vegetarian", "High-Protein"],
    instructions: [
      "Spoon half of the Greek yogurt into a glass or bowl.",
      "Layer half of the mixed blueberries and raspberries.",
      "Add a layer of rolled oats and chia seeds.",
      "Top with remaining yogurt, fruit, and a drizzle of natural almond butter and honey."
    ],
    ingredients: [
      { name: "Greek Yogurt (0% Fat)", amount: 250, unit: "g", category: "Dairy" },
      { name: "Blueberries", amount: 75, unit: "g", category: "Produce" },
      { name: "Raspberries", amount: 50, unit: "g", category: "Produce" },
      { name: "Rolled Oats", amount: 30, unit: "g", category: "Grains" },
      { name: "Almond Butter", amount: 15, unit: "g", category: "Pantry" },
      { name: "Chia Seeds", amount: 10, unit: "g", category: "Pantry" }
    ]
  },
  {
    title: "Avocado & Smoked Salmon Sourdough Toast",
    description: "Crispy toasted whole-grain sourdough topped with smashed lime avocado, wild smoked salmon slices, and microgreens.",
    imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80",
    calories: 440,
    protein: 26,
    carbs: 38,
    fat: 20,
    prepTimeMinutes: 8,
    cookTimeMinutes: 4,
    servings: 1,
    difficulty: "easy",
    mealType: "breakfast",
    cuisine: "Western",
    dietaryTags: ["High-Protein", "Pescatarian"],
    instructions: [
      "Toast sourdough slices until golden and crisp.",
      "Mash ripe avocado with fresh lime juice, salt, and cracked black pepper.",
      "Spread avocado evenly over the toast.",
      "Drape smoked salmon ribbons on top and finish with chili flakes and microgreens."
    ],
    ingredients: [
      { name: "Sourdough Bread", amount: 2, unit: "slices", category: "Grains" },
      { name: "Smoked Salmon", amount: 90, unit: "g", category: "Protein" },
      { name: "Avocado", amount: 0.5, unit: "medium", category: "Produce" },
      { name: "Lime", amount: 0.5, unit: "piece", category: "Produce" },
      { name: "Microgreens", amount: 15, unit: "g", category: "Produce" }
    ]
  },
  {
    title: "Golden Turmeric Oatmeal with Walnuts",
    description: "Creamy warm steel-cut oats simmered with turmeric, cinnamon, unsweetened almond milk, topped with toasted walnuts and sliced banana.",
    imageUrl: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80",
    calories: 360,
    protein: 12,
    carbs: 58,
    fat: 11,
    prepTimeMinutes: 5,
    cookTimeMinutes: 10,
    servings: 1,
    difficulty: "easy",
    mealType: "breakfast",
    cuisine: "Indian",
    dietaryTags: ["Vegan", "Vegetarian", "Heart-Healthy"],
    instructions: [
      "Combine oats, almond milk, turmeric, and cinnamon in a small pot.",
      "Simmer over medium heat for 7-8 minutes, stirring frequently.",
      "Pour into a bowl, garnish with banana rounds, walnuts, and a splash of maple syrup."
    ],
    ingredients: [
      { name: "Rolled Oats", amount: 60, unit: "g", category: "Grains" },
      { name: "Almond Milk", amount: 250, unit: "ml", category: "Dairy" },
      { name: "Walnuts", amount: 20, unit: "g", category: "Pantry" },
      { name: "Banana", amount: 1, unit: "medium", category: "Produce" },
      { name: "Ground Turmeric", amount: 3, unit: "g", category: "Spices" },
      { name: "Cinnamon", amount: 2, unit: "g", category: "Spices" }
    ]
  },
  {
    title: "Keto Spinach & Cheddar Omelet",
    description: "Fluffy three-egg omelet loaded with baby spinach, aged sharp cheddar, and caramelized shallots in grass-fed butter.",
    imageUrl: "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=800&auto=format&fit=crop&q=80",
    calories: 460,
    protein: 29,
    carbs: 4,
    fat: 36,
    prepTimeMinutes: 5,
    cookTimeMinutes: 8,
    servings: 1,
    difficulty: "easy",
    mealType: "breakfast",
    cuisine: "Western",
    dietaryTags: ["Keto", "Low-Carb", "Gluten-Free", "Vegetarian"],
    instructions: [
      "Whisk eggs with a pinch of sea salt and pepper.",
      "Melt butter in a non-stick skillet; sauté spinach until wilted (1 min).",
      "Pour in whisked eggs, gently lift edges to allow uncooked egg to flow underneath.",
      "Sprinkle cheddar cheese, fold omelet in half, and slide onto a warm plate."
    ],
    ingredients: [
      { name: "Eggs", amount: 3, unit: "large", category: "Protein" },
      { name: "Baby Spinach", amount: 60, unit: "g", category: "Produce" },
      { name: "Cheddar Cheese", amount: 40, unit: "g", category: "Dairy" },
      { name: "Butter", amount: 15, unit: "g", category: "Dairy" }
    ]
  },
  {
    title: "South Indian Sambar Idli Platter",
    description: "Steamed fermented rice and lentil cakes served in piping hot spiced vegetable lentil stew with coconut chutney.",
    imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80",
    calories: 340,
    protein: 14,
    carbs: 62,
    fat: 5,
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 1,
    difficulty: "medium",
    mealType: "breakfast",
    cuisine: "Indian",
    dietaryTags: ["Vegan", "Vegetarian", "Gluten-Free", "Low-Calorie"],
    instructions: [
      "Steam idli batter in an idli cooker for 10 minutes until fluffy and firm.",
      "Simmer toor dal with tamarind, sambar powder, carrots, drumsticks, and tomatoes.",
      "Temper with mustard seeds, curry leaves, and asafoetida in hot oil.",
      "Immerse warm idlis in a deep bowl of piping hot sambar."
    ],
    ingredients: [
      { name: "Idli Batter", amount: 200, unit: "g", category: "Grains" },
      { name: "Toor Dal (Pigeon Peas)", amount: 50, unit: "g", category: "Pantry" },
      { name: "Tomato", amount: 1, unit: "medium", category: "Produce" },
      { name: "Carrot", amount: 1, unit: "medium", category: "Produce" },
      { name: "Sambar Powder", amount: 10, unit: "g", category: "Spices" }
    ]
  },

  // Lunches
  {
    title: "Grilled Lemon Herb Chicken Quinoa Bowl",
    description: "Tender herb-marinated chicken breast served over fluffy tri-color quinoa, roasted cherry tomatoes, English cucumber, and tzatziki.",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80",
    calories: 520,
    protein: 48,
    carbs: 45,
    fat: 14,
    prepTimeMinutes: 15,
    cookTimeMinutes: 18,
    servings: 1,
    difficulty: "medium",
    mealType: "lunch",
    cuisine: "Mediterranean",
    dietaryTags: ["High-Protein", "Gluten-Free"],
    instructions: [
      "Marinate chicken breast with lemon zest, lemon juice, oregano, garlic, salt, and olive oil for 15 mins.",
      "Cook quinoa in vegetable broth according to package instructions.",
      "Grill chicken in a hot skillet for 6-7 minutes per side until internal temp reaches 74°C (165°F).",
      "Slice chicken and arrange over cooked quinoa with diced cucumber, halved cherry tomatoes, and tzatziki."
    ],
    ingredients: [
      { name: "Chicken Breast", amount: 180, unit: "g", category: "Protein" },
      { name: "Quinoa", amount: 65, unit: "g", category: "Grains" },
      { name: "Cherry Tomatoes", amount: 80, unit: "g", category: "Produce" },
      { name: "Cucumber", amount: 70, unit: "g", category: "Produce" },
      { name: "Tzatziki Dip", amount: 40, unit: "g", category: "Dairy" },
      { name: "Lemon", amount: 0.5, unit: "piece", category: "Produce" },
      { name: "Olive Oil", amount: 10, unit: "ml", category: "Pantry" }
    ]
  },
  {
    title: "Paneer Tikka Power Bowl",
    description: "Smoky tandoori marinated paneer cubes charred to perfection, served with warm brown basmati rice, mint yogurt dressing, and crisp cabbage.",
    imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80",
    calories: 510,
    protein: 28,
    carbs: 46,
    fat: 23,
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    servings: 1,
    difficulty: "medium",
    mealType: "lunch",
    cuisine: "Indian",
    dietaryTags: ["Vegetarian", "High-Protein", "Gluten-Free"],
    instructions: [
      "Toss paneer cubes in thick yogurt, Kashmiri red chili powder, garam masala, and lemon juice.",
      "Sear paneer on a hot griddle or pan for 2-3 mins per side until golden charred.",
      "Assemble bowl with brown rice, crisp shredded red cabbage, pickled onions, and mint chutney."
    ],
    ingredients: [
      { name: "Paneer", amount: 150, unit: "g", category: "Protein" },
      { name: "Brown Basmati Rice", amount: 60, unit: "g", category: "Grains" },
      { name: "Plain Yogurt", amount: 50, unit: "g", category: "Dairy" },
      { name: "Red Cabbage", amount: 50, unit: "g", category: "Produce" },
      { name: "Garam Masala", amount: 5, unit: "g", category: "Spices" }
    ]
  },
  {
    title: "Wild Salmon Poke Bowl with Edamame",
    description: "Fresh sashimi-grade Atlantic salmon cubes tossed in tamari sesame oil, served over jasmine rice with avocado, wakame, and edamame.",
    imageUrl: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800&auto=format&fit=crop&q=80",
    calories: 540,
    protein: 38,
    carbs: 52,
    fat: 18,
    prepTimeMinutes: 12,
    cookTimeMinutes: 12,
    servings: 1,
    difficulty: "easy",
    mealType: "lunch",
    cuisine: "Asian",
    dietaryTags: ["Pescatarian", "High-Protein"],
    instructions: [
      "Cook jasmine rice and allow to cool to room temperature.",
      "Cube fresh salmon and gently toss with soy sauce, sesame oil, and scallions.",
      "Place rice in a bowl and arrange salmon, shelled edamame, sliced avocado, and shredded nori.",
      "Finish with toasted white sesame seeds and spicy sriracha mayo drizzle."
    ],
    ingredients: [
      { name: "Fresh Salmon Fillet", amount: 160, unit: "g", category: "Protein" },
      { name: "Jasmine Rice", amount: 70, unit: "g", category: "Grains" },
      { name: "Edamame (Shelled)", amount: 60, unit: "g", category: "Produce" },
      { name: "Avocado", amount: 0.5, unit: "medium", category: "Produce" },
      { name: "Sesame Oil", amount: 8, unit: "ml", category: "Pantry" },
      { name: "Soy Sauce (Tamari)", amount: 15, unit: "ml", category: "Pantry" }
    ]
  },
  {
    title: "Crispy Tofu Peanut Crunch Salad",
    description: "Golden pan-fried organic firm tofu tossed with crisp purple cabbage, romaine lettuce, edamame, carrots, and spicy Thai peanut lime dressing.",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80",
    calories: 430,
    protein: 26,
    carbs: 31,
    fat: 22,
    prepTimeMinutes: 15,
    cookTimeMinutes: 10,
    servings: 1,
    difficulty: "easy",
    mealType: "lunch",
    cuisine: "Asian",
    dietaryTags: ["Vegan", "Vegetarian", "High-Protein", "Gluten-Free"],
    instructions: [
      "Press tofu dry with paper towels, cut into cubes, and toss with cornstarch.",
      "Pan-fry tofu in sesame oil until all sides are crunchy and golden (8 mins).",
      "Whisk peanut butter, soy sauce, lime juice, ginger, and maple syrup into dressing.",
      "Toss salad greens, carrots, and edamame in a large bowl, top with hot crispy tofu and peanuts."
    ],
    ingredients: [
      { name: "Firm Tofu", amount: 180, unit: "g", category: "Protein" },
      { name: "Peanut Butter", amount: 25, unit: "g", category: "Pantry" },
      { name: "Romaine Lettuce", amount: 80, unit: "g", category: "Produce" },
      { name: "Carrot", amount: 1, unit: "medium", category: "Produce" },
      { name: "Red Cabbage", amount: 60, unit: "g", category: "Produce" },
      { name: "Lime", amount: 0.5, unit: "piece", category: "Produce" }
    ]
  },
  {
    title: "Mexican Chipotle Chicken Burrito Bowl",
    description: "Chipotle-spiced grilled chicken strips over cilantro lime brown rice, seasoned black beans, sweet corn salsa, and guacamole.",
    imageUrl: "https://images.unsplash.com/photo-1543353071-873f17a7a088?w=800&auto=format&fit=crop&q=80",
    calories: 560,
    protein: 44,
    carbs: 60,
    fat: 16,
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    servings: 1,
    difficulty: "medium",
    mealType: "lunch",
    cuisine: "Mexican",
    dietaryTags: ["High-Protein", "Gluten-Free"],
    instructions: [
      "Season chicken with chipotle chili, cumin, garlic powder, and lime.",
      "Grill chicken until thoroughly cooked and slice into strips.",
      "Warm black beans and sweet corn with cumin.",
      "Assemble over brown rice mixed with lime juice and chopped fresh cilantro, topped with guacamole."
    ],
    ingredients: [
      { name: "Chicken Breast", amount: 160, unit: "g", category: "Protein" },
      { name: "Brown Basmati Rice", amount: 65, unit: "g", category: "Grains" },
      { name: "Black Beans (Canned)", amount: 100, unit: "g", category: "Pantry" },
      { name: "Sweet Corn", amount: 50, unit: "g", category: "Produce" },
      { name: "Avocado", amount: 0.5, unit: "medium", category: "Produce" },
      { name: "Cilantro", amount: 15, unit: "g", category: "Produce" }
    ]
  },
  {
    title: "Italian Pesto Turkey & Mozzarella Wrap",
    description: "Oven-roasted lean sliced turkey breast wrapped with fresh basil pesto, ripe vine tomatoes, baby spinach, and soft buffalo mozzarella.",
    imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&auto=format&fit=crop&q=80",
    calories: 470,
    protein: 41,
    carbs: 32,
    fat: 19,
    prepTimeMinutes: 8,
    cookTimeMinutes: 4,
    servings: 1,
    difficulty: "easy",
    mealType: "lunch",
    cuisine: "Italian",
    dietaryTags: ["High-Protein"],
    instructions: [
      "Spread basil pesto across a large whole-wheat tortilla.",
      "Layer slices of lean turkey breast, mozzarella, baby spinach, and sliced tomatoes.",
      "Tightly roll wrap, toast lightly on a dry pan for 2 minutes each side until cheese melts slightly.",
      "Slice diagonally and serve warm."
    ],
    ingredients: [
      { name: "Whole-Wheat Tortilla Wrap", amount: 1, unit: "piece", category: "Grains" },
      { name: "Turkey Breast (Deli / Roasted)", amount: 140, unit: "g", category: "Protein" },
      { name: "Mozzarella Cheese", amount: 45, unit: "g", category: "Dairy" },
      { name: "Basil Pesto", amount: 20, unit: "g", category: "Pantry" },
      { name: "Tomato", amount: 1, unit: "medium", category: "Produce" },
      { name: "Baby Spinach", amount: 30, unit: "g", category: "Produce" }
    ]
  },

  // Dinners
  {
    title: "Herb-Crusted Baked Salmon with Asparagus",
    description: "Fresh Atlantic salmon fillet coated with Dijon mustard, fresh dill, and garlic, baked alongside tender lemon asparagus spears.",
    imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&auto=format&fit=crop&q=80",
    calories: 490,
    protein: 43,
    carbs: 9,
    fat: 31,
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 1,
    difficulty: "easy",
    mealType: "dinner",
    cuisine: "Western",
    dietaryTags: ["Keto", "High-Protein", "Pescatarian", "Gluten-Free", "Low-Carb"],
    instructions: [
      "Preheat oven to 200°C (400°F).",
      "Place salmon fillet and trimmed asparagus spears on a parchment-lined baking sheet.",
      "Brush salmon with Dijon mustard, olive oil, minced garlic, fresh chopped dill, and sea salt.",
      "Drizzle asparagus with olive oil and squeeze fresh lemon juice.",
      "Bake for 14-16 minutes until salmon flakes easily with a fork."
    ],
    ingredients: [
      { name: "Fresh Salmon Fillet", amount: 200, unit: "g", category: "Protein" },
      { name: "Asparagus", amount: 150, unit: "g", category: "Produce" },
      { name: "Olive Oil", amount: 12, unit: "ml", category: "Pantry" },
      { name: "Dijon Mustard", amount: 10, unit: "g", category: "Pantry" },
      { name: "Garlic", amount: 2, unit: "cloves", category: "Produce" },
      { name: "Lemon", amount: 0.5, unit: "piece", category: "Produce" }
    ]
  },
  {
    title: "North Indian Dal Tadka with Jeera Rice",
    description: "Silky yellow lentils cooked with turmeric and ginger, finished with an aromatic ghee tempering of cumin seeds, dried red chilies, and garlic.",
    imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80",
    calories: 480,
    protein: 21,
    carbs: 76,
    fat: 10,
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    servings: 1,
    difficulty: "medium",
    mealType: "dinner",
    cuisine: "Indian",
    dietaryTags: ["Vegetarian", "High-Protein", "Gluten-Free"],
    instructions: [
      "Pressure cook yellow moong and toor dal with turmeric, salt, and water until soft.",
      "Whisk dal until creamy.",
      "Heat ghee in a pan, add cumin seeds, chopped garlic, green chilies, and Kashmiri chili powder.",
      "Pour sizzled tempering into hot dal, cover immediately to infuse aromas.",
      "Serve over fragrant cumin-infused basmati rice."
    ],
    ingredients: [
      { name: "Yellow Moong Dal", amount: 70, unit: "g", category: "Pantry" },
      { name: "Basmati Rice", amount: 65, unit: "g", category: "Grains" },
      { name: "Ghee", amount: 12, unit: "g", category: "Dairy" },
      { name: "Garlic", amount: 4, unit: "cloves", category: "Produce" },
      { name: "Tomato", amount: 1, unit: "medium", category: "Produce" },
      { name: "Cumin Seeds", amount: 5, unit: "g", category: "Spices" }
    ]
  },
  {
    title: "Garlic Butter Steak Bites with Sweet Potato",
    description: "Seared sirloin steak bites glazed in roasted garlic herb butter, accompanied by roasted sweet potato wedges and steamed broccoli.",
    imageUrl: "https://images.unsplash.com/photo-1558030006-450675393462?w=800&auto=format&fit=crop&q=80",
    calories: 580,
    protein: 52,
    carbs: 42,
    fat: 22,
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 1,
    difficulty: "medium",
    mealType: "dinner",
    cuisine: "American",
    dietaryTags: ["High-Protein", "Gluten-Free"],
    instructions: [
      "Roast cubed sweet potatoes at 210°C (410°F) for 20 mins until caramelised.",
      "Cut sirloin steak into bite-sized cubes; season generously with coarse salt and cracked pepper.",
      "Sear steak in a smoking hot cast iron skillet with olive oil for 3-4 minutes until nicely browned.",
      "Add butter, crushed garlic, and fresh rosemary; baste steak bites for 1 minute.",
      "Serve hot with roasted sweet potatoes and steamed broccoli."
    ],
    ingredients: [
      { name: "Sirloin Steak", amount: 190, unit: "g", category: "Protein" },
      { name: "Sweet Potato", amount: 180, unit: "g", category: "Produce" },
      { name: "Broccoli", amount: 120, unit: "g", category: "Produce" },
      { name: "Butter", amount: 15, unit: "g", category: "Dairy" },
      { name: "Garlic", amount: 3, unit: "cloves", category: "Produce" }
    ]
  },
  {
    title: "Thai Green Curry with Crispy Tofu & Bamboo",
    description: "Creamy aromatic coconut green curry simmered with lemongrass, kaffir lime, crispy tofu cubes, bamboo shoots, and Thai eggplants.",
    imageUrl: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&auto=format&fit=crop&q=80",
    calories: 510,
    protein: 24,
    carbs: 44,
    fat: 27,
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    servings: 1,
    difficulty: "medium",
    mealType: "dinner",
    cuisine: "Asian",
    dietaryTags: ["Vegan", "Vegetarian", "Gluten-Free"],
    instructions: [
      "Fry Thai green curry paste in coconut cream until fragrant and oil separates.",
      "Add remaining coconut milk, vegetable broth, bamboo shoots, and zucchini chunks.",
      "Simmer for 8 minutes, add crispy baked tofu cubes and fresh Thai basil leaves.",
      "Serve over steamed fragrant jasmine rice."
    ],
    ingredients: [
      { name: "Firm Tofu", amount: 180, unit: "g", category: "Protein" },
      { name: "Coconut Milk (Light)", amount: 180, unit: "ml", category: "Pantry" },
      { name: "Jasmine Rice", amount: 60, unit: "g", category: "Grains" },
      { name: "Zucchini", amount: 1, unit: "medium", category: "Produce" },
      { name: "Green Curry Paste", amount: 30, unit: "g", category: "Pantry" },
      { name: "Basil (Thai)", amount: 15, unit: "g", category: "Produce" }
    ]
  },
  {
    title: "Italian Turkey Bolognese with Whole Wheat Penne",
    description: "Slow-simmered lean ground turkey ragu with San Marzano tomatoes, garlic, carrots, and oregano over al dente whole wheat penne pasta.",
    imageUrl: "https://images.unsplash.com/photo-1621996346565-e3d5d6281146?w=800&auto=format&fit=crop&q=80",
    calories: 530,
    protein: 46,
    carbs: 62,
    fat: 11,
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    servings: 1,
    difficulty: "easy",
    mealType: "dinner",
    cuisine: "Italian",
    dietaryTags: ["High-Protein", "Low-Fat"],
    instructions: [
      "Boil whole wheat penne in salted water until al dente.",
      "Brown lean ground turkey in olive oil with diced onion, celery, and carrot.",
      "Pour in crushed Italian tomatoes, oregano, and simmer on low heat for 20 minutes.",
      "Toss penne into sauce, garnish with grated Parmigiano Reggiano."
    ],
    ingredients: [
      { name: "Ground Turkey (93% Lean)", amount: 170, unit: "g", category: "Protein" },
      { name: "Whole-Wheat Penne Pasta", amount: 75, unit: "g", category: "Grains" },
      { name: "Crushed Tomatoes", amount: 180, unit: "g", category: "Pantry" },
      { name: "Parmesan Cheese", amount: 15, unit: "g", category: "Dairy" },
      { name: "Onion", amount: 0.5, unit: "medium", category: "Produce" },
      { name: "Garlic", amount: 2, unit: "cloves", category: "Produce" }
    ]
  },

  // Snacks & Quick Bites
  {
    title: "Choco-Peanut Protein Energy Balls",
    description: "No-bake wholesome energy bites made with dark cocoa, natural peanut butter, rolled oats, whey protein, and raw honey.",
    imageUrl: "https://images.unsplash.com/photo-1606851094655-b2593a9af63f?w=800&auto=format&fit=crop&q=80",
    calories: 220,
    protein: 16,
    carbs: 22,
    fat: 8,
    prepTimeMinutes: 10,
    cookTimeMinutes: 0,
    servings: 1,
    difficulty: "easy",
    mealType: "snack",
    cuisine: "American",
    dietaryTags: ["Vegetarian", "High-Protein"],
    instructions: [
      "In a bowl, mix rolled oats, chocolate protein powder, and unsweetened cocoa.",
      "Fold in peanut butter and honey until a thick dough forms.",
      "Roll into two golf-ball sized rounds and refrigerate for 20 minutes."
    ],
    ingredients: [
      { name: "Whey Protein Powder", amount: 20, unit: "g", category: "Pantry" },
      { name: "Rolled Oats", amount: 30, unit: "g", category: "Grains" },
      { name: "Peanut Butter", amount: 20, unit: "g", category: "Pantry" },
      { name: "Honey", amount: 10, unit: "g", category: "Pantry" },
      { name: "Cocoa Powder", amount: 5, unit: "g", category: "Pantry" }
    ]
  },
  {
    title: "Roasted Garlic Hummus with Veggie Sticks",
    description: "Silky homemade chickpea hummus drizzled with extra virgin olive oil and paprika, paired with crisp bell pepper, carrot, and cucumber spears.",
    imageUrl: "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=800&auto=format&fit=crop&q=80",
    calories: 210,
    protein: 8,
    carbs: 24,
    fat: 9,
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    servings: 1,
    difficulty: "easy",
    mealType: "snack",
    cuisine: "Mediterranean",
    dietaryTags: ["Vegan", "Vegetarian", "Gluten-Free", "Low-Calorie"],
    instructions: [
      "Spoon hummus into a shallow dipping bowl and create a shallow well in the center.",
      "Drizzle with cold-pressed olive oil and dust with smoked paprika.",
      "Serve with chilled sliced cucumbers, carrot batons, and red bell peppers."
    ],
    ingredients: [
      { name: "Hummus", amount: 90, unit: "g", category: "Pantry" },
      { name: "Cucumber", amount: 80, unit: "g", category: "Produce" },
      { name: "Carrot", amount: 80, unit: "g", category: "Produce" },
      { name: "Olive Oil", amount: 5, unit: "ml", category: "Pantry" }
    ]
  },
  {
    title: "Cottage Cheese with Honey & Walnuts",
    description: "Creamy high-protein cottage cheese sprinkled with toasted California walnuts, ground cinnamon, and raw forest honey.",
    imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80",
    calories: 230,
    protein: 24,
    carbs: 12,
    fat: 9,
    prepTimeMinutes: 3,
    cookTimeMinutes: 0,
    servings: 1,
    difficulty: "easy",
    mealType: "snack",
    cuisine: "Western",
    dietaryTags: ["Vegetarian", "High-Protein", "Keto-Friendly"],
    instructions: [
      "Scoop low-fat cottage cheese into a bowl.",
      "Top with roughly chopped walnuts and a dusting of cinnamon.",
      "Finish with a drizzle of honey."
    ],
    ingredients: [
      { name: "Cottage Cheese", amount: 180, unit: "g", category: "Dairy" },
      { name: "Walnuts", amount: 15, unit: "g", category: "Pantry" },
      { name: "Honey", amount: 8, unit: "g", category: "Pantry" }
    ]
  },
  {
    title: "Spiced Roasted Chickpeas",
    description: "Crunchy oven-roasted garbanzo beans tossed with extra virgin olive oil, smoked paprika, ground cumin, and sea salt.",
    imageUrl: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=800&auto=format&fit=crop&q=80",
    calories: 190,
    protein: 9,
    carbs: 26,
    fat: 6,
    prepTimeMinutes: 5,
    cookTimeMinutes: 25,
    servings: 1,
    difficulty: "easy",
    mealType: "snack",
    cuisine: "Middle Eastern",
    dietaryTags: ["Vegan", "Vegetarian", "Gluten-Free", "Low-Calorie"],
    instructions: [
      "Drain and thoroughly dry canned chickpeas with a clean kitchen towel.",
      "Toss with olive oil, smoked paprika, cumin, and sea salt.",
      "Bake at 200°C (400°F) for 25-30 minutes, shaking halfway through until golden and super crispy."
    ],
    ingredients: [
      { name: "Chickpeas (Canned)", amount: 130, unit: "g", category: "Pantry" },
      { name: "Olive Oil", amount: 7, unit: "ml", category: "Pantry" },
      { name: "Paprika", amount: 3, unit: "g", category: "Spices" },
      { name: "Cumin Seeds", amount: 2, unit: "g", category: "Spices" }
    ]
  },
  // Additional Meals for diversity and swap alternatives
  {
    title: "Egg Rice Protein Bowl",
    description: "Quick scrambled eggs with toasted sesame oil over warm brown rice, green peas, scallions, and tamari soy sauce.",
    imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&auto=format&fit=crop&q=80",
    calories: 495,
    protein: 26,
    carbs: 58,
    fat: 16,
    prepTimeMinutes: 8,
    cookTimeMinutes: 10,
    servings: 1,
    difficulty: "easy",
    mealType: "lunch",
    cuisine: "Asian",
    dietaryTags: ["Vegetarian", "High-Protein"],
    instructions: [
      "Scramble 3 fresh eggs in sesame oil until soft curds form.",
      "Toss in cooked brown rice, thawed green peas, and chopped scallions.",
      "Season with tamari soy sauce, cracked pepper, and a touch of chili oil."
    ],
    ingredients: [
      { name: "Eggs", amount: 3, unit: "large", category: "Protein" },
      { name: "Brown Basmati Rice", amount: 70, unit: "g", category: "Grains" },
      { name: "Green Peas", amount: 50, unit: "g", category: "Produce" },
      { name: "Soy Sauce (Tamari)", amount: 15, unit: "ml", category: "Pantry" },
      { name: "Sesame Oil", amount: 8, unit: "ml", category: "Pantry" }
    ]
  },
  {
    title: "Mediterranean Grilled Chicken Wrap",
    description: "Juicy grilled chicken tenderloins wrapped with crisp cucumber, Kalamata olives, diced tomato, and creamy garlic tzatziki.",
    imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=80",
    calories: 530,
    protein: 45,
    carbs: 38,
    fat: 18,
    prepTimeMinutes: 10,
    cookTimeMinutes: 10,
    servings: 1,
    difficulty: "easy",
    mealType: "lunch",
    cuisine: "Mediterranean",
    dietaryTags: ["High-Protein"],
    instructions: [
      "Grill seasoned chicken tenders in a hot pan for 4 minutes per side.",
      "Warm pita or wrap, spread with tzatziki sauce.",
      "Fill with sliced chicken, cucumbers, halved cherry tomatoes, and kalamata olives.",
      "Fold tightly and serve warm."
    ],
    ingredients: [
      { name: "Chicken Breast", amount: 160, unit: "g", category: "Protein" },
      { name: "Whole-Wheat Tortilla Wrap", amount: 1, unit: "piece", category: "Grains" },
      { name: "Tzatziki Dip", amount: 40, unit: "g", category: "Dairy" },
      { name: "Cucumber", amount: 50, unit: "g", category: "Produce" },
      { name: "Cherry Tomatoes", amount: 50, unit: "g", category: "Produce" }
    ]
  },
  {
    title: "High-Protein Lentil & Paneer Curry",
    description: "Slow-simmered green and brown lentils with golden seared paneer cubes in an aromatic roasted tomato and ginger masala.",
    imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80",
    calories: 485,
    protein: 33,
    carbs: 38,
    fat: 17,
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    servings: 1,
    difficulty: "medium",
    mealType: "dinner",
    cuisine: "Indian",
    dietaryTags: ["Vegetarian", "High-Protein", "Gluten-Free"],
    instructions: [
      "Sear paneer cubes in ghee until golden and set aside.",
      "Sauté diced onions, cumin, minced ginger, and garlic in a pan.",
      "Add crushed tomatoes, turmeric, garam masala, and cooked brown lentils.",
      "Simmer for 10 minutes, fold in seared paneer, and garnish with fresh cilantro."
    ],
    ingredients: [
      { name: "Paneer", amount: 120, unit: "g", category: "Protein" },
      { name: "Lentils (Cooked)", amount: 140, unit: "g", category: "Pantry" },
      { name: "Tomato", amount: 1, unit: "medium", category: "Produce" },
      { name: "Onion", amount: 0.5, unit: "medium", category: "Produce" },
      { name: "Ghee", amount: 10, unit: "g", category: "Dairy" },
      { name: "Garam Masala", amount: 5, unit: "g", category: "Spices" }
    ]
  },
  {
    title: "Mediterranean Grilled Tofu & Roasted Quinoa",
    description: "Herb-marinated extra firm tofu grilled over flame, served over fluffy warm quinoa with roasted red peppers and tahini garlic dressing.",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80",
    calories: 430,
    protein: 29,
    carbs: 42,
    fat: 14,
    prepTimeMinutes: 12,
    cookTimeMinutes: 15,
    servings: 1,
    difficulty: "easy",
    mealType: "dinner",
    cuisine: "Mediterranean",
    dietaryTags: ["Vegan", "Vegetarian", "High-Protein", "Gluten-Free"],
    instructions: [
      "Marinate pressed tofu slabs in oregano, lemon juice, olive oil, and garlic.",
      "Grill tofu in a hot grill pan for 4 minutes per side until charred grill lines appear.",
      "Fluff cooked quinoa with chopped parsley and lemon zest.",
      "Serve grilled tofu over quinoa, drizzled with warm tahini sauce."
    ],
    ingredients: [
      { name: "Firm Tofu", amount: 190, unit: "g", category: "Protein" },
      { name: "Quinoa", amount: 60, unit: "g", category: "Grains" },
      { name: "Tahini", amount: 15, unit: "g", category: "Pantry" },
      { name: "Red Bell Pepper", amount: 1, unit: "medium", category: "Produce" },
      { name: "Olive Oil", amount: 8, unit: "ml", category: "Pantry" }
    ]
  },
  {
    title: "Korean Bibimbap with Crispy Tofu & Egg",
    description: "Warm brown rice bowl topped with sautéed spinach, mushrooms, carrots, a sunny-side-up egg, crispy tofu, and authentic gochujang chili sauce.",
    imageUrl: "https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=800&auto=format&fit=crop&q=80",
    calories: 490,
    protein: 28,
    carbs: 55,
    fat: 16,
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    servings: 1,
    difficulty: "medium",
    mealType: "dinner",
    cuisine: "Asian",
    dietaryTags: ["Vegetarian", "High-Protein"],
    instructions: [
      "Sauté baby spinach, julienned carrots, and shiitake separately with a drop of sesame oil.",
      "Pan-sear cubed tofu until crispy and fry 1 egg sunny-side-up.",
      "Place warm brown rice in a bowl, arrange vegetable segments and tofu on top.",
      "Crown with the fried egg and a dollop of gochujang sauce."
    ],
    ingredients: [
      { name: "Brown Basmati Rice", amount: 65, unit: "g", category: "Grains" },
      { name: "Firm Tofu", amount: 120, unit: "g", category: "Protein" },
      { name: "Eggs", amount: 1, unit: "large", category: "Protein" },
      { name: "Baby Spinach", amount: 50, unit: "g", category: "Produce" },
      { name: "Carrot", amount: 1, unit: "medium", category: "Produce" },
      { name: "Sesame Oil", amount: 7, unit: "ml", category: "Pantry" }
    ]
  }
];
