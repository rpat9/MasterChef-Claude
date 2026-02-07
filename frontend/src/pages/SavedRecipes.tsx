import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Header } from '../components/layout/Header';
import { RecipeCard } from '../components/recipe/RecipeCard';
import { RecipeDetail } from '../components/recipe/RecipeDetail';
import { EmptyState } from '../components/recipe/EmptyState';
import type { Recipe } from '../types/recipe';

// Mock saved recipes for demonstration
const MOCK_SAVED_RECIPES: Recipe[] = [
    {
        id: '1',
        title: 'Garlic Butter Chicken',
        description: 'Tender chicken thighs with crispy skin and a rich garlic butter sauce.',
        cookTime: '45 mins',
        servings: 4,
        difficulty: 'easy',
        ingredients: ['Chicken', 'Garlic', 'Butter', 'Thyme'],
        instructions: ['Season chicken', 'Sear in pan', 'Add garlic butter', 'Roast in oven'],
        tags: ['Chicken', 'One-Pan', 'Gluten-Free'],
        isSaved: true,
    },
    {
        id: '2',
        title: 'Mediterranean Quinoa Bowl',
        description: 'Fresh and healthy quinoa bowl with vegetables and feta cheese.',
        cookTime: '30 mins',
        servings: 2,
        difficulty: 'easy',
        ingredients: ['Quinoa', 'Tomatoes', 'Cucumber', 'Feta'],
        instructions: ['Cook quinoa', 'Chop vegetables', 'Mix together', 'Add dressing'],
        tags: ['Vegetarian', 'Healthy', 'Mediterranean'],
        isSaved: true,
    },
    {
        id: '3',
        title: 'Spicy Thai Basil Stir-Fry',
        description: 'Quick and flavorful stir-fry with Thai basil and chili.',
        cookTime: '20 mins',
        servings: 3,
        difficulty: 'medium',
        ingredients: ['Tofu', 'Thai Basil', 'Chili', 'Soy Sauce'],
        instructions: ['Press tofu', 'Heat wok', 'Stir-fry aromatics', 'Add basil'],
        tags: ['Thai', 'Vegan', 'Spicy'],
        isSaved: true,
    },
];

const SavedRecipes = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

    // TODO: Fetch saved recipes from API
    // Example:
    // const { data: savedRecipes, isLoading } = useQuery(['savedRecipes'], api.recipes.getSaved);
    const savedRecipes = MOCK_SAVED_RECIPES;

    const filteredRecipes = savedRecipes.filter(
        (recipe) =>
            recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            recipe.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleUnsaveRecipe = async (recipeId: string) => {
        // TODO: Implement unsave recipe via API
        // Example:
        // await api.recipes.unsave(recipeId);

        console.log('Unsave recipe:', recipeId);
    };

    const handleLogout = () => {
        // TODO: Implement logout via API
        console.log('Logout');
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header
                isAuthenticated={true}
                userName="Chef"
                onLogout={handleLogout}
            />

            <main className="flex-1 container max-w-5xl py-8 px-4">
                <div className="space-y-8">
                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="font-display text-3xl font-bold">Saved Recipes</h1>
                            <p className="text-muted-foreground">
                                Your personal collection of favorite recipes
                            </p>
                        </div>

                        {/* Search */}
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search saved recipes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Recipe Grid */}
                    {filteredRecipes.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredRecipes.map((recipe, index) => (
                                <RecipeCard
                                    key={recipe.id}
                                    recipe={recipe}
                                    onView={setSelectedRecipe}
                                    onSave={handleUnsaveRecipe}
                                    className="animate-fade-in"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                />
                            ))}
                        </div>
                    ) : searchQuery ? (
                        <div className="text-center py-16">
                            <p className="text-muted-foreground">
                                No recipes found matching "{searchQuery}"
                            </p>
                            <Button
                                variant="link"
                                onClick={() => setSearchQuery('')}
                                className="mt-2"
                            >
                                Clear search
                            </Button>
                        </div>
                    ) : (
                        <EmptyState type="saved" />
                    )}
                </div>
            </main>

            {/* Recipe Detail Modal */}
            {selectedRecipe && (
                <RecipeDetail
                    recipe={selectedRecipe}
                    onClose={() => setSelectedRecipe(null)}
                    onSave={handleUnsaveRecipe}
                />
            )}
        </div>
    );
};

export default SavedRecipes;
