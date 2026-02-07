import { ChefHat, Utensils, BookOpen } from 'lucide-react';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
    type: 'ingredients' | 'recipes' | 'saved';
    className?: string;
}

const states = {
    ingredients: {
        icon: Utensils,
        title: 'Add your ingredients',
        description: 'Start by adding the ingredients you have on hand. We\'ll find the perfect recipe for you.',
    },
    recipes: {
        icon: ChefHat,
        title: 'No recipes found',
        description: 'Try adding more ingredients or adjusting your dietary preferences.',
    },
    saved: {
        icon: BookOpen,
        title: 'No saved recipes yet',
        description: 'When you find a recipe you love, save it here for easy access later.',
    },
};

export function EmptyState({ type, className }: EmptyStateProps) {
    const state = states[type];
    const Icon = state.icon;

    return (
        <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <Icon className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">{state.title}</h3>
            <p className="text-muted-foreground max-w-sm">{state.description}</p>
        </div>
    );
}
