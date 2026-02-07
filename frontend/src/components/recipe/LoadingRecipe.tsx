import { ChefHat, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LoadingRecipeProps {
    className?: string;
}

export function LoadingRecipe({ className }: LoadingRecipeProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-16 space-y-6", className)}>
            {/* Animated Chef Icon */}
            <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sage-light to-amber-light flex items-center justify-center animate-pulse">
                    <ChefHat className="h-12 w-12 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 animate-bounce">
                    <Sparkles className="h-6 w-6 text-secondary" />
                </div>
            </div>

            {/* Loading Text */}
            <div className="text-center space-y-2">
                <h3 className="font-display text-xl font-semibold">
                    Creating your recipe...
                </h3>
                <p className="text-muted-foreground">
                    Our AI chef is working on something delicious
                </p>
            </div>

            {/* Loading Dots */}
            <div className="flex items-center gap-2">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="w-3 h-3 rounded-full bg-primary animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                    />
                ))}
            </div>
        </div>
    );
}
