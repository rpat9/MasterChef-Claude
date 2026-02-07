import { type HTMLAttributes } from 'react';
import { Clock, Users, ChefHat, Bookmark, BookmarkCheck } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { type Recipe } from '../../types/recipe';
import { cn } from '../../lib/utils';

interface RecipeCardProps extends HTMLAttributes<HTMLDivElement> {
    recipe: Recipe;
    onSave?: (recipeId: string) => void;
    onView?: (recipe: Recipe) => void;
}

const difficultyColors = {
    easy: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    hard: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export function RecipeCard({ recipe, onSave, onView, className, ...props }: RecipeCardProps) {
    return (
        <Card
            className={cn(
                "group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer animate-fade-in",
                className
            )}
            onClick={() => onView?.(recipe)}
            {...props}
        >
            {/* Recipe Image */}
            <div className="relative h-48 bg-gradient-to-br from-sage-light to-amber-light overflow-hidden">
                {recipe.imageUrl ? (
                    <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <ChefHat className="h-16 w-16 text-primary/30" />
                    </div>
                )}

                {/* Save Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 bg-card/80 backdrop-blur-sm hover:bg-card shadow-sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implement save functionality via API
                        onSave?.(recipe.id);
                    }}
                >
                    {recipe.isSaved ? (
                        <BookmarkCheck className="h-5 w-5 text-primary" />
                    ) : (
                        <Bookmark className="h-5 w-5" />
                    )}
                </Button>

                {/* Difficulty Badge */}
                <Badge
                    className={cn(
                        "absolute bottom-3 left-3 capitalize",
                        difficultyColors[recipe.difficulty]
                    )}
                >
                    {recipe.difficulty}
                </Badge>
            </div>

            <CardContent className="p-4 space-y-3">
                <h3 className="font-display text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                    {recipe.title}
                </h3>

                <p className="text-sm text-muted-foreground line-clamp-2">
                    {recipe.description}
                </p>

                {/* Recipe Meta */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{recipe.cookTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{recipe.servings} servings</span>
                    </div>
                </div>

                {/* Tags */}
                {recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {recipe.tags.slice(0, 3).map((tag) => (
                            <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs font-normal"
                            >
                                {tag}
                            </Badge>
                        ))}
                        {recipe.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs font-normal">
                                +{recipe.tags.length - 3}
                            </Badge>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
