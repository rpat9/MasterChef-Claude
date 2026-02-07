import { Clock, Users, ChefHat, Bookmark, BookmarkCheck, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/seperator';
import { type Recipe } from '../../types/recipe';
import { cn } from '../../lib/utils';

interface RecipeDetailProps {
    recipe: Recipe;
    onClose: () => void;
    onSave?: (recipeId: string) => void;
}

const difficultyColors = {
    easy: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    hard: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export function RecipeDetail({ recipe, onClose, onSave }: RecipeDetailProps) {
    return (
        <div className="fixed inset-0 z-50 bg-background animate-fade-in overflow-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
                <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Button variant="ghost" onClick={onClose} className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            // TODO: Implement save via API
                            onSave?.(recipe.id);
                        }}
                        className="gap-2"
                    >
                        {recipe.isSaved ? (
                            <>
                                <BookmarkCheck className="h-4 w-4" />
                                Saved
                            </>
                        ) : (
                            <>
                                <Bookmark className="h-4 w-4" />
                                Save Recipe
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="container max-w-4xl mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-sage-light to-amber-light mb-8">
                    {recipe.imageUrl ? (
                        <img
                            src={recipe.imageUrl}
                            alt={recipe.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <ChefHat className="h-24 w-24 text-primary/30" />
                        </div>
                    )}
                </div>

                {/* Title & Meta */}
                <div className="space-y-4 mb-8">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge className={cn("capitalize", difficultyColors[recipe.difficulty])}>
                            {recipe.difficulty}
                        </Badge>
                        {recipe.tags.map((tag) => (
                            <Badge key={tag} variant="outline">
                                {tag}
                            </Badge>
                        ))}
                    </div>

                    <h1 className="font-display text-3xl md:text-4xl font-bold">
                        {recipe.title}
                    </h1>

                    <p className="text-lg text-muted-foreground">
                        {recipe.description}
                    </p>

                    <div className="flex items-center gap-6 text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            <span>{recipe.cookTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            <span>{recipe.servings} servings</span>
                        </div>
                    </div>
                </div>

                <Separator className="my-8" />

                {/* Content Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Ingredients */}
                    <div className="md:col-span-1">
                        <h2 className="font-display text-xl font-semibold mb-4">Ingredients</h2>
                        <ul className="space-y-3">
                            {recipe.ingredients.map((ingredient, index) => (
                                <li
                                    key={index}
                                    className="flex items-start gap-3 animate-slide-in"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                                    <span>{ingredient}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Instructions */}
                    <div className="md:col-span-2">
                        <h2 className="font-display text-xl font-semibold mb-4">Instructions</h2>
                        <ol className="space-y-6">
                            {recipe.instructions.map((instruction, index) => (
                                <li
                                    key={index}
                                    className="flex gap-4 animate-slide-in"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-semibold">
                                        {index + 1}
                                    </div>
                                    <p className="pt-1">{instruction}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}
