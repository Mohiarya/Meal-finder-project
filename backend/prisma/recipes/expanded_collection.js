export const expandedCollectionRecipes = [
  // ===================== INDIAN ADDITIONAL =====================
  {
    title: "Paneer Butter Masala with Brown Rice",
    description: "Tender paneer cubes in a rich, velvety roasted tomato and cashew cream sauce spiced with fenugreek leaves and cardamom, served over brown rice.",
    imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80",
    calories: 540,
    protein: 26,
    carbs: 48,
    fat: 27,
    prepTimeMinutes: 12,
    cookTimeMinutes: 18,
    servings: 1,
    difficulty: "medium",
    mealType: "dinner",
    cuisine: "Indian",
    dietaryTags: ["Vegetarian", "High-Protein", "Gluten-Free"],
    instructions: [
      "Blend soaked cashews and crushed tomatoes into a silky gravy.",
      "Sauté ginger-garlic paste in a little ghee, add tomato-cashew puree, turmeric, and Kashmiri chili.",
      "Simmer for 10 mins, stir in low-fat cream, crushed kasuri methi (fenugreek), and paneer cubes.",
      "Serve hot over steamed brown basmati rice."
    ],
    ingredients: [
      { name: "Paneer", amount: 140, unit: "g", category: "Protein" },
      { name: "Brown Basmati Rice", amount: 60, unit: "g", category: "Grains" },
      { name: "Crushed Tomatoes", amount: 120, unit: "g", category: "Pantry" },
      { name: "Cashews", amount: 15, unit: "g", category: "Pantry" },
      { name: "Ghee", amount: 8, unit: "g", category: "Dairy" }
    ]
  },
  {
    title: "Kerala Coconut Fish Curry",
    description: "Wild white fish simmered in a fragrant South Indian coconut and kokum curry tempered with mustard seeds, fresh curry leaves, and green chilies.",
    imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=80",
    calories: 420,
    protein: 36,
    carbs: 38,
    fat: 14,
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 1,
    difficulty: "medium",
    mealType: "dinner",
    cuisine: "Indian",
    dietaryTags: ["Pescatarian", "High-Protein", "Gluten-Free", "Low-Calorie"],
    instructions: [
      "Sauté mustard seeds, curry leaves, fenugreek, and shallots in coconut oil.",
      "Add turmeric, coriander powder, light coconut milk, and dried kokum or tamarind water.",
      "Gently place fish fillets in the bubbling curry and simmer for 6 minutes until tender.",
      "Serve warm over steamed basmati rice."
    ],
    ingredients: [
      { name: "White Fish Fillet (Cod)", amount: 190, unit: "g", category: "Protein" },
      { name: "Coconut Milk (Light)", amount: 120, unit: "ml", category: "Pantry" },
      { name: "Basmati Rice", amount: 55, unit: "g", category: "Grains" },
      { name: "Curry Leaves", amount: 5, unit: "g", category: "Produce" },
      { name: "Mustard Seeds", amount: 3, unit: "g", category: "Spices" }
    ]
  },
  {
    title: "Baingan Bharta (Roasted Eggplant) with Roti",
    description: "Smoky fire-roasted mashed eggplant sautéed with onions, garlic, green peas, and ripe tomatoes, served with warm whole-wheat roti.",
    imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80",
    calories: 320,
    protein: 10,
    carbs: 52,
    fat: 8,
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    servings: 1,
    difficulty: "medium",
    mealType: "dinner",
    cuisine: "Indian",
    dietaryTags: ["Vegan", "Vegetarian", "Low-Calorie"],
    instructions: [
      "Roast whole eggplant over an open flame until charred and skin is blistered; peel and mash pulp.",
      "Sauté cumin seeds, chopped onions, minced garlic, and green chilies in oil.",
      "Add chopped tomatoes and green peas, cook until softened.",
      "Fold in mashed eggplant, cook for 8 mins, and serve with hot whole-wheat rotis."
    ],
    ingredients: [
      { name: "Eggplant", amount: 250, unit: "g", category: "Produce" },
      { name: "Whole-Wheat Roti", amount: 2, unit: "pieces", category: "Grains" },
      { name: "Green Peas", amount: 40, unit: "g", category: "Produce" },
      { name: "Tomato", amount: 1, unit: "medium", category: "Produce" },
      { name: "Garlic", amount: 3, unit: "cloves", category: "Produce" }
    ]
  },
  {
    title: "Masala Chai Spiced Overnight Oats",
    description: "Rolled oats infused with brewed black tea, crushed cardamom, cinnamon, clove, chia seeds, and protein powder, topped with chopped pistachios.",
    imageUrl: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80",
    calories: 330,
    protein: 26,
    carbs: 42,
    fat: 7,
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    servings: 1,
    difficulty: "easy",
    mealType: "breakfast",
    cuisine: "Indian",
    dietaryTags: ["Vegetarian", "High-Protein", "Low-Calorie"],
    instructions: [
      "Brew strong black chai with crushed cardamom pods, cinnamon, and ginger; cool completely.",
      "Mix rolled oats, whey protein, chia seeds, and chai tea in a mason jar.",
      "Refrigerate overnight; garnish with crushed pistachios before eating."
    ],
    ingredients: [
      { name: "Rolled Oats", amount: 50, unit: "g", category: "Grains" },
      { name: "Vanilla Protein Powder", amount: 25, unit: "g", category: "Protein" },
      { name: "Almond Milk", amount: 150, unit: "ml", category: "Dairy" },
      { name: "Chia Seeds", amount: 8, unit: "g", category: "Pantry" },
      { name: "Cardamom", amount: 2, unit: "g", category: "Spices" }
    ]
  },

  // ===================== MEDITERRANEAN ADDITIONAL =====================
  {
    title: "Moroccan Chickpea & Sweet Potato Tagine",
    description: "Aromatic North African stew slow-simmered with chickpeas, sweet potato cubes, dried apricots, cinnamon, and cumin, served over couscous.",
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80",
    calories: 430,
    protein: 16,
    carbs: 76,
    fat: 8,
    prepTimeMinutes: 12,
    cookTimeMinutes: 25,
    servings: 1,
    difficulty: "medium",
    mealType: "dinner",
    cuisine: "Mediterranean",
    dietaryTags: ["Vegan", "Vegetarian", "Low-Calorie"],
    instructions: [
      "Sauté diced onions, garlic, cinnamon stick, cumin, and ginger in olive oil.",
      "Add cubed sweet potatoes, cooked chickpeas, chopped apricots, and vegetable broth.",
      "Cover and simmer on low for 20 minutes until sweet potatoes are tender and sauce is thick.",
      "Serve over steamed whole-wheat couscous, garnished with toasted sliced almonds."
    ],
    ingredients: [
      { name: "Chickpeas (Cooked)", amount: 140, unit: "g", category: "Pantry" },
      { name: "Sweet Potato", amount: 150, unit: "g", category: "Produce" },
      { name: "Whole-Wheat Couscous", amount: 50, unit: "g", category: "Grains" },
      { name: "Olive Oil", amount: 8, unit: "ml", category: "Pantry" },
      { name: "Cinnamon", amount: 2, unit: "g", category: "Spices" }
    ]
  },
  {
    title: "Greek Spanakorizo (Spinach Rice) with Feta",
    description: "Traditional Greek one-pot lemon dill rice cooked with mountains of fresh spinach, spring scallions, and topped with authentic Greek feta cheese.",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80",
    calories: 360,
    protein: 15,
    carbs: 52,
    fat: 11,
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    servings: 1,
    difficulty: "easy",
    mealType: "dinner",
    cuisine: "Mediterranean",
    dietaryTags: ["Vegetarian", "Gluten-Free", "Low-Calorie"],
    instructions: [
      "Sauté sliced scallions and olive oil in a pot until tender.",
      "Add washed baby spinach in batches until wilted.",
      "Stir in arborio or basmati rice, vegetable stock, lemon juice, and fresh dill.",
      "Cover and cook on low for 16 minutes until rice is tender; fold in crumbled feta before serving."
    ],
    ingredients: [
      { name: "Baby Spinach", amount: 160, unit: "g", category: "Produce" },
      { name: "Basmati Rice", amount: 60, unit: "g", category: "Grains" },
      { name: "Feta Cheese", amount: 35, unit: "g", category: "Dairy" },
      { name: "Olive Oil", amount: 8, unit: "ml", category: "Pantry" },
      { name: "Lemon", amount: 0.5, unit: "piece", category: "Produce" }
    ]
  },
  {
    title: "Mediterranean Sardines on Sourdough",
    description: "Wild-caught Portuguese sardines in olive oil served on toasted rustic sourdough with ripe tomato spread, lemon zest, and fresh parsley.",
    imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80",
    calories: 370,
    protein: 28,
    carbs: 32,
    fat: 14,
    prepTimeMinutes: 5,
    cookTimeMinutes: 3,
    servings: 1,
    difficulty: "easy",
    mealType: "lunch",
    cuisine: "Mediterranean",
    dietaryTags: ["Pescatarian", "High-Protein", "Low-Calorie"],
    instructions: [
      "Rub toasted sourdough slice with a peeled garlic clove and halved ripe tomato.",
      "Arrange boneless, skinless wild sardines across the toast.",
      "Squeeze fresh lemon juice, crack black pepper, and scatter chopped flat-leaf parsley."
    ],
    ingredients: [
      { name: "Canned Sardines", amount: 120, unit: "g", category: "Protein" },
      { name: "Sourdough Bread", amount: 2, unit: "slices", category: "Grains" },
      { name: "Tomato", amount: 1, unit: "medium", category: "Produce" },
      { name: "Parsley", amount: 10, unit: "g", category: "Produce" },
      { name: "Lemon", amount: 0.5, unit: "piece", category: "Produce" }
    ]
  },

  // ===================== ITALIAN ADDITIONAL =====================
  {
    title: "Tuscan White Bean & Kale Soup with Parmesan",
    description: "Rustic Italian soup made with creamy cannellini beans, tender Tuscan kale, garlic, and carrots simmered in a savory herb broth with aged Parmesan.",
    imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop&q=80",
    calories: 310,
    protein: 18,
    carbs: 46,
    fat: 6,
    prepTimeMinutes: 8,
    cookTimeMinutes: 18,
    servings: 1,
    difficulty: "easy",
    mealType: "lunch",
    cuisine: "Italian",
    dietaryTags: ["Vegetarian", "High-Protein", "Gluten-Free", "Low-Calorie", "Low-Fat"],
    instructions: [
      "Sauté diced carrot, celery, and garlic in olive oil for 4 mins.",
      "Add vegetable broth, cooked cannellini beans, and Italian herbs; simmer for 10 minutes.",
      "Stir in chopped Tuscan kale until wilted (2 minutes).",
      "Serve warm topped with freshly grated Parmigiano Reggiano."
    ],
    ingredients: [
      { name: "Cannellini Beans (Cooked)", amount: 160, unit: "g", category: "Pantry" },
      { name: "Tuscan Kale", amount: 80, unit: "g", category: "Produce" },
      { name: "Carrot", amount: 1, unit: "medium", category: "Produce" },
      { name: "Parmesan Cheese", amount: 15, unit: "g", category: "Dairy" },
      { name: "Garlic", amount: 2, unit: "cloves", category: "Produce" }
    ]
  },
  {
    title: "Chicken Piccata with Zucchini Noodles",
    description: "Pan-seared thin chicken cutlets finished in a bright lemon, white wine, and caper sauce over light tender zucchini noodles.",
    imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80",
    calories: 360,
    protein: 44,
    carbs: 10,
    fat: 16,
    prepTimeMinutes: 10,
    cookTimeMinutes: 12,
    servings: 1,
    difficulty: "medium",
    mealType: "dinner",
    cuisine: "Italian",
    dietaryTags: ["High-Protein", "Gluten-Free", "Keto", "Low-Carb", "Low-Calorie"],
    instructions: [
      "Dredge chicken cutlets lightly with salt, pepper, and garlic powder; sear in olive oil for 3 mins per side.",
      "Deglaze skillet with chicken broth, fresh lemon juice, and non-pareil capers; simmer for 2 mins.",
      "Flash-sauté zucchini noodles in the sauce for 1 minute until al dente.",
      "Plate chicken cutlets over zucchini noodles and spoon lemon caper sauce over top."
    ],
    ingredients: [
      { name: "Chicken Breast", amount: 180, unit: "g", category: "Protein" },
      { name: "Zucchini (Spiralized)", amount: 200, unit: "g", category: "Produce" },
      { name: "Lemon", amount: 1, unit: "piece", category: "Produce" },
      { name: "Capers", amount: 15, unit: "g", category: "Pantry" },
      { name: "Olive Oil", amount: 10, unit: "ml", category: "Pantry" }
    ]
  },
  {
    title: "Baked Cod Puttanesca",
    description: "Pacific cod baked in an Italian San Marzano tomato sauce bursting with kalamata olives, capers, garlic, and fresh oregano.",
    imageUrl: "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&auto=format&fit=crop&q=80",
    calories: 340,
    protein: 38,
    carbs: 15,
    fat: 14,
    prepTimeMinutes: 8,
    cookTimeMinutes: 16,
    servings: 1,
    difficulty: "easy",
    mealType: "dinner",
    cuisine: "Italian",
    dietaryTags: ["Pescatarian", "High-Protein", "Gluten-Free", "Low-Calorie", "Low-Carb"],
    instructions: [
      "Simmer crushed tomatoes with sliced garlic, halved kalamata olives, capers, and oregano for 8 mins.",
      "Place cod fillets into an oven-safe dish, pour puttanesca sauce over fish.",
      "Bake at 200°C (400°F) for 14 minutes until fish flakes easily.",
      "Garnish with chopped fresh parsley."
    ],
    ingredients: [
      { name: "Cod Fillet", amount: 190, unit: "g", category: "Protein" },
      { name: "Crushed Tomatoes", amount: 150, unit: "g", category: "Pantry" },
      { name: "Kalamata Olives", amount: 20, unit: "g", category: "Pantry" },
      { name: "Capers", amount: 10, unit: "g", category: "Pantry" },
      { name: "Olive Oil", amount: 8, unit: "ml", category: "Pantry" }
    ]
  },

  // ===================== MEXICAN ADDITIONAL =====================
  {
    title: "Slow-Cooked Chicken Tinga Tacos",
    description: "Tender shredded chicken breast simmered in a smoky chipotle-tomato sauce, served in warm corn tortillas with diced red onion and cilantro.",
    imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=80",
    calories: 410,
    protein: 38,
    carbs: 36,
    fat: 13,
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 1,
    difficulty: "easy",
    mealType: "dinner",
    cuisine: "Mexican",
    dietaryTags: ["High-Protein", "Gluten-Free", "Low-Calorie"],
    instructions: [
      "Poach and shred chicken breast with two forks.",
      "Blend roasted tomatoes, chipotle peppers in adobo, and garlic until smooth.",
      "Simmer shredded chicken in the chipotle sauce for 8 mins until deeply flavored.",
      "Fill warm corn tortillas with chicken tinga and garnish with cilantro and diced red onion."
    ],
    ingredients: [
      { name: "Chicken Breast", amount: 170, unit: "g", category: "Protein" },
      { name: "Corn Tortillas", amount: 2, unit: "pieces", category: "Grains" },
      { name: "Chipotle in Adobo", amount: 20, unit: "g", category: "Pantry" },
      { name: "Tomato", amount: 1, unit: "medium", category: "Produce" },
      { name: "Onion", amount: 0.5, unit: "medium", category: "Produce" }
    ]
  },
  {
    title: "Mexican Street Corn & Black Bean Power Salad",
    description: "Charred sweet corn kernels, tender black beans, diced avocado, cilantro, and crumbled cotija cheese tossed with smoked chili lime dressing.",
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80",
    calories: 370,
    protein: 15,
    carbs: 52,
    fat: 14,
    prepTimeMinutes: 8,
    cookTimeMinutes: 6,
    servings: 1,
    difficulty: "easy",
    mealType: "lunch",
    cuisine: "Mexican",
    dietaryTags: ["Vegetarian", "Gluten-Free", "Low-Calorie"],
    instructions: [
      "Char sweet corn in a hot dry skillet for 5 minutes until browned and smoky.",
      "In a bowl, combine charred corn, black beans, diced avocado, and chopped cilantro.",
      "Whisk lime juice, chili powder, and olive oil; toss with salad.",
      "Top with crumbled cotija or feta cheese."
    ],
    ingredients: [
      { name: "Sweet Corn", amount: 100, unit: "g", category: "Produce" },
      { name: "Black Beans (Cooked)", amount: 120, unit: "g", category: "Pantry" },
      { name: "Avocado", amount: 0.5, unit: "medium", category: "Produce" },
      { name: "Cotija Cheese", amount: 25, unit: "g", category: "Dairy" },
      { name: "Lime", amount: 1, unit: "piece", category: "Produce" }
    ]
  },

  // ===================== AMERICAN ADDITIONAL =====================
  {
    title: "Crispy Air-Fried Lemon Herb Chicken Tenders",
    description: "Crunchy almond-crusted lean chicken breast tenders seasoned with rosemary and garlic, served with steamed broccoli and honey Dijon dip.",
    imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?w=800&auto=format&fit=crop&q=80",
    calories: 420,
    protein: 48,
    carbs: 18,
    fat: 18,
    prepTimeMinutes: 10,
    cookTimeMinutes: 12,
    servings: 1,
    difficulty: "easy",
    mealType: "dinner",
    cuisine: "American",
    dietaryTags: ["High-Protein", "Gluten-Free", "Low-Calorie"],
    instructions: [
      "Cut chicken breast into tenders; coat in whisked egg white, then dredge in almond flour and herbs.",
      "Air fry at 195°C (385°F) for 10-12 minutes until crispy and golden.",
      "Serve with steamed broccoli and a side of Dijon mustard."
    ],
    ingredients: [
      { name: "Chicken Breast", amount: 180, unit: "g", category: "Protein" },
      { name: "Almond Flour", amount: 25, unit: "g", category: "Pantry" },
      { name: "Broccoli", amount: 120, unit: "g", category: "Produce" },
      { name: "Dijon Mustard", amount: 15, unit: "g", category: "Pantry" },
      { name: "Egg Whites", amount: 30, unit: "ml", category: "Protein" }
    ]
  },
  {
    title: "Slow-Cooked Turkey Chili with Black Beans",
    description: "Lean ground turkey slow-simmered with sweet potato cubes, black beans, crushed tomatoes, cumin, and cocoa powder for deep rich flavor.",
    imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80",
    calories: 460,
    protein: 44,
    carbs: 48,
    fat: 12,
    prepTimeMinutes: 10,
    cookTimeMinutes: 30,
    servings: 1,
    difficulty: "easy",
    mealType: "dinner",
    cuisine: "American",
    dietaryTags: ["High-Protein", "Gluten-Free"],
    instructions: [
      "Brown ground turkey with diced onions and minced garlic in a Dutch oven.",
      "Add crushed tomatoes, cubed sweet potato, black beans, cumin, and chili powder.",
      "Simmer covered on low heat for 25 minutes until sweet potatoes are tender.",
      "Serve hot in deep bowls garnished with chopped scallions."
    ],
    ingredients: [
      { name: "Ground Turkey (93% Lean)", amount: 170, unit: "g", category: "Protein" },
      { name: "Black Beans (Cooked)", amount: 100, unit: "g", category: "Pantry" },
      { name: "Sweet Potato", amount: 120, unit: "g", category: "Produce" },
      { name: "Crushed Tomatoes", amount: 150, unit: "g", category: "Pantry" },
      { name: "Onion", amount: 0.5, unit: "medium", category: "Produce" }
    ]
  },

  // ===================== JAPANESE ADDITIONAL =====================
  {
    title: "Chicken Oyakodon (Japanese Chicken & Egg Bowl)",
    description: "Tender chicken thigh and sweet simmered yellow onions cooked in savory dashi soy broth, topped with velvety soft-set eggs over warm rice.",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80",
    calories: 490,
    protein: 42,
    carbs: 52,
    fat: 14,
    prepTimeMinutes: 8,
    cookTimeMinutes: 10,
    servings: 1,
    difficulty: "easy",
    mealType: "lunch",
    cuisine: "Japanese",
    dietaryTags: ["High-Protein"],
    instructions: [
      "Simmer sliced onions in dashi broth, tamari, and mirin in a small skillet for 3 mins.",
      "Add bite-sized chicken pieces; cook for 4 minutes until chicken is done.",
      "Gently pour beaten eggs over chicken; cover and cook for 1 minute until eggs are soft set.",
      "Slide whole mixture over a warm bowl of steamed rice and garnish with scallions."
    ],
    ingredients: [
      { name: "Chicken Breast", amount: 160, unit: "g", category: "Protein" },
      { name: "Eggs", amount: 2, unit: "large", category: "Protein" },
      { name: "Jasmine Rice", amount: 60, unit: "g", category: "Grains" },
      { name: "Onion", amount: 0.5, unit: "medium", category: "Produce" },
      { name: "Soy Sauce (Tamari)", amount: 15, unit: "ml", category: "Pantry" }
    ]
  },
  {
    title: "Cold Sesame Soba Noodles with Crispy Tofu",
    description: "Chilled Japanese buckwheat soba noodles tossed in toasted sesame ginger dressing with crispy pan-seared tofu, edamame, and cucumber ribbons.",
    imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80",
    calories: 420,
    protein: 26,
    carbs: 58,
    fat: 12,
    prepTimeMinutes: 10,
    cookTimeMinutes: 8,
    servings: 1,
    difficulty: "easy",
    mealType: "lunch",
    cuisine: "Japanese",
    dietaryTags: ["Vegan", "Vegetarian", "High-Protein", "Low-Calorie"],
    instructions: [
      "Boil soba noodles for 5 minutes; drain and rinse thoroughly under icy cold water.",
      "Pan-sear cubed firm tofu in sesame oil until crispy.",
      "Whisk toasted sesame paste, soy sauce, rice vinegar, and grated ginger.",
      "Toss chilled noodles with dressing, cucumber ribbons, and edamame; crown with crispy tofu."
    ],
    ingredients: [
      { name: "Buckwheat Soba Noodles", amount: 70, unit: "g", category: "Grains" },
      { name: "Firm Tofu", amount: 140, unit: "g", category: "Protein" },
      { name: "Edamame (Shelled)", amount: 40, unit: "g", category: "Produce" },
      { name: "Cucumber", amount: 50, unit: "g", category: "Produce" },
      { name: "Sesame Oil", amount: 8, unit: "ml", category: "Pantry" }
    ]
  },

  // ===================== KOREAN ADDITIONAL =====================
  {
    title: "Korean Braised Dubu Jorim (Spicy Soy Tofu)",
    description: "Pan-fried golden tofu slabs braised in a savory Korean soy, garlic, and gochugaru reduction with scallions, served with brown rice.",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80",
    calories: 380,
    protein: 28,
    carbs: 44,
    fat: 12,
    prepTimeMinutes: 8,
    cookTimeMinutes: 10,
    servings: 1,
    difficulty: "easy",
    mealType: "dinner",
    cuisine: "Korean",
    dietaryTags: ["Vegan", "Vegetarian", "High-Protein", "Gluten-Free", "Low-Calorie"],
    instructions: [
      "Pan-sear thick slices of firm tofu in sesame oil until golden on both sides.",
      "Pour braising sauce (tamari, garlic, chili flakes, water, scallions) over tofu.",
      "Simmer for 4 minutes until tofu absorbs the sauce and liquid reduces to a glaze.",
      "Serve over steamed brown rice."
    ],
    ingredients: [
      { name: "Firm Tofu", amount: 190, unit: "g", category: "Protein" },
      { name: "Brown Basmati Rice", amount: 55, unit: "g", category: "Grains" },
      { name: "Scallions", amount: 25, unit: "g", category: "Produce" },
      { name: "Soy Sauce (Tamari)", amount: 15, unit: "ml", category: "Pantry" },
      { name: "Sesame Oil", amount: 6, unit: "ml", category: "Pantry" }
    ]
  },
  {
    title: "Korean BBQ Glazed Salmon with Steamed Rice",
    description: "Crispy skin-on salmon fillet brushed with sweet-spicy gochujang garlic glaze, served with steamed brown rice and quick cucumber banchan.",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80",
    calories: 490,
    protein: 42,
    carbs: 42,
    fat: 18,
    prepTimeMinutes: 8,
    cookTimeMinutes: 12,
    servings: 1,
    difficulty: "easy",
    mealType: "dinner",
    cuisine: "Korean",
    dietaryTags: ["Pescatarian", "High-Protein"],
    instructions: [
      "Whisk gochujang chili paste, tamari, mirin, minced garlic, and sesame oil.",
      "Pan-sear salmon skin-side down for 4 mins, flip and brush generously with glaze.",
      "Cook for 3 additional minutes until salmon is caramelized and medium-rare.",
      "Serve with steamed brown rice and sliced pickled cucumbers."
    ],
    ingredients: [
      { name: "Fresh Salmon Fillet", amount: 180, unit: "g", category: "Protein" },
      { name: "Brown Basmati Rice", amount: 55, unit: "g", category: "Grains" },
      { name: "Gochujang Paste", amount: 15, unit: "g", category: "Pantry" },
      { name: "Cucumber", amount: 50, unit: "g", category: "Produce" },
      { name: "Sesame Oil", amount: 6, unit: "ml", category: "Pantry" }
    ]
  },

  // ===================== THAI ADDITIONAL =====================
  {
    title: "Thai Coconut Chicken Soup (Tom Kha Gai)",
    description: "Fragrant Thai soup made with coconut milk, galangal, lemongrass, kaffir lime, and tender poached chicken breast with sliced button mushrooms.",
    imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop&q=80",
    calories: 410,
    protein: 42,
    carbs: 14,
    fat: 22,
    prepTimeMinutes: 10,
    cookTimeMinutes: 12,
    servings: 1,
    difficulty: "easy",
    mealType: "dinner",
    cuisine: "Thai",
    dietaryTags: ["High-Protein", "Gluten-Free", "Low-Carb", "Low-Calorie", "Keto"],
    instructions: [
      "Simmer light coconut milk and chicken broth with bruised lemongrass and galangal.",
      "Add sliced chicken breast and mushrooms; simmer for 6 minutes until chicken is cooked.",
      "Season with fish sauce, fresh lime juice, and chili oil; discard tough stalk pieces before serving."
    ],
    ingredients: [
      { name: "Chicken Breast", amount: 180, unit: "g", category: "Protein" },
      { name: "Coconut Milk (Light)", amount: 160, unit: "ml", category: "Pantry" },
      { name: "Lemongrass", amount: 15, unit: "g", category: "Produce" },
      { name: "Lime", amount: 1, unit: "piece", category: "Produce" },
      { name: "Chili Oil", amount: 5, unit: "ml", category: "Pantry" }
    ]
  },
  {
    title: "Thai Pineapple Fried Rice with Cashews",
    description: "Aromatic jasmine rice stir-fried with sweet golden pineapple chunks, yellow curry powder, scrambled eggs, green peas, and toasted crunchy cashews.",
    imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&auto=format&fit=crop&q=80",
    calories: 440,
    protein: 18,
    carbs: 65,
    fat: 14,
    prepTimeMinutes: 10,
    cookTimeMinutes: 8,
    servings: 1,
    difficulty: "easy",
    mealType: "lunch",
    cuisine: "Thai",
    dietaryTags: ["Vegetarian", "High-Protein", "Low-Calorie"],
    instructions: [
      "Scramble 2 eggs in a hot wok and set aside.",
      "Stir-fry cold cooked jasmine rice with curry powder, soy sauce, and white pepper on high heat.",
      "Add diced pineapple, green peas, scrambled eggs, and roasted cashews; toss for 2 minutes until hot.",
      "Serve garnished with fresh cilantro and lime wedge."
    ],
    ingredients: [
      { name: "Jasmine Rice", amount: 65, unit: "g", category: "Grains" },
      { name: "Eggs", amount: 2, unit: "large", category: "Protein" },
      { name: "Pineapple (Diced)", amount: 80, unit: "g", category: "Produce" },
      { name: "Cashews", amount: 18, unit: "g", category: "Pantry" },
      { name: "Curry Powder", amount: 5, unit: "g", category: "Spices" }
    ]
  }
];
