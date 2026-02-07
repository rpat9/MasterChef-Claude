// Recipe App Types

export interface Ingredient {
    id: string;
    name: string;
}

export interface DietaryPreference {
    id: string;
    label: string;
    description?: string;
}

export interface Recipe {
    id: string;
    title: string;
    description: string;
    cookTime: string;
    servings: number;
    difficulty: 'easy' | 'medium' | 'hard';
    ingredients: string[];
    instructions: string[];
    tags: string[];
    imageUrl?: string;
    isSaved?: boolean;
    createdAt?: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    dietaryPreferences: string[];
    savedRecipes: string[];
}

// Dietary restriction options
export const DIETARY_OPTIONS: DietaryPreference[] = [
    { id: 'vegetarian', label: 'Vegetarian', description: 'No meat or fish' },
    { id: 'vegan', label: 'Vegan', description: 'No animal products' },
    { id: 'gluten-free', label: 'Gluten-Free', description: 'No gluten-containing grains' },
    { id: 'dairy-free', label: 'Dairy-Free', description: 'No milk or dairy products' },
    { id: 'nut-free', label: 'Nut-Free', description: 'No tree nuts or peanuts' },
    { id: 'low-carb', label: 'Low-Carb', description: 'Reduced carbohydrates' },
    { id: 'keto', label: 'Keto', description: 'Very low-carb, high-fat' },
    { id: 'paleo', label: 'Paleo', description: 'No processed foods, grains, or dairy' },
    { id: 'halal', label: 'Halal', description: 'Prepared according to Islamic law' },
    { id: 'kosher', label: 'Kosher', description: 'Prepared according to Jewish law' },
];

// Common ingredient suggestions
export const COMMON_INGREDIENTS = [
    'Chicken', 'Beef', 'Pork', 'Salmon', 'Shrimp', 'Tofu',
    'Rice', 'Pasta', 'Bread', 'Potatoes', 'Quinoa',
    'Tomatoes', 'Onions', 'Garlic', 'Bell Peppers', 'Spinach', 'Broccoli',
    'Carrots', 'Mushrooms', 'Zucchini', 'Avocado', 'Lettuce',
    'Eggs', 'Cheese', 'Milk', 'Butter', 'Cream',
    'Olive Oil', 'Lemon', 'Lime', 'Ginger', 'Cilantro', 'Basil',
];