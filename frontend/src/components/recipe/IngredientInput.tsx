import { useState, useCallback, type KeyboardEvent } from 'react';
import { X, Plus, Search } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { COMMON_INGREDIENTS, type Ingredient } from '../../types/recipe';
import { cn } from '../../lib/utils';

interface IngredientInputProps {
    ingredients: Ingredient[];
    onIngredientsChange: (ingredients: Ingredient[]) => void;
    className?: string;
}

export function IngredientInput({
    ingredients,
    onIngredientsChange,
    className
}: IngredientInputProps) {
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const filteredSuggestions = COMMON_INGREDIENTS.filter(
        (ingredient) =>
            ingredient.toLowerCase().includes(inputValue.toLowerCase()) &&
            !ingredients.find((i) => i.name.toLowerCase() === ingredient.toLowerCase())
    ).slice(0, 8);

    const addIngredient = useCallback((name: string) => {
        const trimmedName = name.trim();
        if (!trimmedName) return;

        const exists = ingredients.find(
            (i) => i.name.toLowerCase() === trimmedName.toLowerCase()
        );

        if (!exists) {
            const newIngredient: Ingredient = {
                id: crypto.randomUUID(),
                name: trimmedName,
            };
            onIngredientsChange([...ingredients, newIngredient]);
        }

        setInputValue('');
        setShowSuggestions(false);
    }, [ingredients, onIngredientsChange]);

    const removeIngredient = useCallback((id: string) => {
        onIngredientsChange(ingredients.filter((i) => i.id !== id));
    }, [ingredients, onIngredientsChange]);

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addIngredient(inputValue);
        }
    };

    return (
        <div className={cn("space-y-4", className)}>
            <div className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Type an ingredient (e.g., chicken, tomatoes...)"
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        onKeyDown={handleKeyDown}
                        className="pl-10 pr-20 h-12 text-base bg-card border-border focus:ring-primary"
                    />
                    <Button
                        type="button"
                        size="sm"
                        onClick={() => addIngredient(inputValue)}
                        disabled={!inputValue.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                    </Button>
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && inputValue && filteredSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg animate-fade-in">
                        <ul className="py-2">
                            {filteredSuggestions.map((suggestion) => (
                                <li key={suggestion}>
                                    <button
                                        type="button"
                                        className="w-full px-4 py-2 text-left hover:bg-accent transition-colors"
                                        onMouseDown={() => addIngredient(suggestion)}
                                    >
                                        {suggestion}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Selected Ingredients */}
            {ingredients.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {ingredients.map((ingredient, index) => (
                        <Badge
                            key={ingredient.id}
                            variant="secondary"
                            className="px-3 py-1.5 text-sm bg-sage-light text-foreground hover:bg-sage-light/80 animate-scale-in"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {ingredient.name}
                            <button
                                type="button"
                                onClick={() => removeIngredient(ingredient.id)}
                                className="ml-2 hover:text-destructive transition-colors"
                                aria-label={`Remove ${ingredient.name}`}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}

            {/* Quick Add Suggestions */}
            {ingredients.length === 0 && (
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Popular ingredients:</p>
                    <div className="flex flex-wrap gap-2">
                        {COMMON_INGREDIENTS.slice(0, 10).map((suggestion) => (
                            <button
                                key={suggestion}
                                type="button"
                                onClick={() => addIngredient(suggestion)}
                                className="px-3 py-1 text-sm rounded-full border border-border hover:border-primary hover:bg-accent transition-colors"
                            >
                                + {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
