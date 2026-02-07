import { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Header } from '../components/layout/Header';
import { IngredientInput } from '../components/recipe/IngredientInput';
import { DietaryPreferences } from '../components/recipe/DietaryPreferences';
import { RecipeCard } from '../components/recipe/RecipeCard';
import { RecipeDetail } from '../components/recipe/RecipeDetail';
import { LoadingRecipe } from '../components/recipe/LoadingRecipe';
import { EmptyState } from '../components/recipe/EmptyState';
import type { Ingredient, Recipe } from '../types/recipe';

// Mock recipe for demonstration
const MOCK_RECIPE: Recipe = {
    id: '1',
    title: 'Garlic Butter Chicken with Roasted Vegetables',
    description: 'A delicious and easy one-pan meal featuring tender chicken thighs with crispy skin, roasted vegetables, and a rich garlic butter sauce.',
    cookTime: '45 mins',
    servings: 4,
    difficulty: 'easy',
    ingredients: [
        '4 chicken thighs, bone-in, skin-on',
        '2 cups broccoli florets',
        '1 cup cherry tomatoes',
        '4 cloves garlic, minced',
        '3 tbsp butter',
        '2 tbsp olive oil',
        'Salt and pepper to taste',
        '1 tsp dried thyme',
        'Fresh parsley for garnish',
    ],
    instructions: [
        'Preheat your oven to 425°F (220°C).',
        'Season chicken thighs generously with salt, pepper, and dried thyme.',
        'Heat olive oil in a large oven-safe skillet over medium-high heat.',
        'Place chicken thighs skin-side down and sear for 5-6 minutes until golden and crispy.',
        'Flip the chicken and add broccoli and tomatoes around it.',
        'Melt butter with minced garlic and drizzle over everything.',
        'Transfer the skillet to the oven and roast for 25-30 minutes.',
        'Let rest for 5 minutes, then garnish with fresh parsley and serve.',
    ],
    tags: ['Chicken', 'One-Pan', 'Gluten-Free', 'High-Protein'],
    isSaved: false,
};

const Dashboard = () => {
    // State management
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

    // Mock user data - replace with actual auth state
    const isAuthenticated = true;
    const userName = 'Chef';

    const handleGenerateRecipe = async () => {
        if (ingredients.length === 0) return;
        
        setIsGenerating(true);
        
        // TODO: Implement recipe generation via API
        // Example:
        // const response = await api.recipes.generate({
        //   ingredients: ingredients.map(i => i.name),
        //   dietaryPreferences,
        // });
        // setGeneratedRecipe(response.data);
        
        console.log('Generating recipe with:', {
            ingredients: ingredients.map(i => i.name),
            dietaryPreferences,
        });
        
        // Simulating API call
        setTimeout(() => {
            setGeneratedRecipe(MOCK_RECIPE);
            setIsGenerating(false);
        }, 2000);
    };

    const handleSaveRecipe = async (recipeId: string) => {
        // TODO: Implement save recipe via API
        // Example:
        // await api.recipes.save(recipeId);
        
        console.log('Save recipe:', recipeId);
        
        // Optimistic update
        if (generatedRecipe && generatedRecipe.id === recipeId) {
            setGeneratedRecipe({ ...generatedRecipe, isSaved: !generatedRecipe.isSaved });
        }
    };

    const handleLogout = () => {
        // TODO: Implement logout via API
        // Example:
        // await api.auth.logout();
        // navigate('/');
        
        console.log('Logout');
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header 
                isAuthenticated={isAuthenticated} 
                userName={userName}
                onLogout={handleLogout}
            />

            <main className="flex-1 container max-w-5xl py-8 px-4">
                <div className="space-y-8">
                    {/* Page Header */}
                    <div className="text-center space-y-2">
                        <h1 className="font-display text-3xl font-bold">Find Your Next Recipe</h1>
                        <p className="text-muted-foreground">
                            Add your ingredients and preferences to discover the perfect meal
                        </p>
                    </div>

                    {/* Ingredients Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">What's in your kitchen?</CardTitle>
                            <CardDescription>
                                Add the ingredients you have available
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <IngredientInput
                                ingredients={ingredients}
                                onIngredientsChange={setIngredients}
                            />
                        </CardContent>
                    </Card>

                    {/* Dietary Preferences Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Dietary Preferences</CardTitle>
                            <CardDescription>
                                Select any dietary restrictions or preferences (optional)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DietaryPreferences
                                selected={dietaryPreferences}
                                onSelectionChange={setDietaryPreferences}
                            />
                        </CardContent>
                    </Card>

                    {/* Generate Button */}
                    <div className="flex justify-center">
                        <Button
                            size="lg"
                            onClick={handleGenerateRecipe}
                            disabled={ingredients.length === 0 || isGenerating}
                            className="gap-2 h-12 px-8 text-lg"
                        >
                            {isGenerating ? (
                                <>
                                    <RefreshCw className="h-5 w-5 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-5 w-5" />
                                    Generate Recipe
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Results Section */}
                    <div className="min-h-[300px]">
                        {isGenerating ? (
                            <LoadingRecipe />
                        ) : generatedRecipe ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-display text-xl font-semibold">Your Recipe</h2>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleGenerateRecipe}
                                        className="gap-2"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Try Another
                                    </Button>
                                </div>
                                <div className="max-w-sm">
                                    <RecipeCard
                                        recipe={generatedRecipe}
                                        onView={setSelectedRecipe}
                                        onSave={handleSaveRecipe}
                                    />
                                </div>
                            </div>
                        ) : ingredients.length === 0 ? (
                            <EmptyState type="ingredients" />
                        ) : (
                            <EmptyState type="recipes" />
                        )}
                    </div>
                </div>
            </main>

            {/* Recipe Detail Modal */}
            {selectedRecipe && (
                <RecipeDetail
                    recipe={selectedRecipe}
                    onClose={() => setSelectedRecipe(null)}
                    onSave={handleSaveRecipe}
                />
            )}
        </div>
    );
};

export default Dashboard;
