import { Check } from 'lucide-react';
import { DIETARY_OPTIONS } from '../../types/recipe';
import { cn } from '../../lib/utils';

interface DietaryPreferencesProps {
    selected: string[];
    onSelectionChange: (selected: string[]) => void;
    className?: string;
}

export function DietaryPreferences({
    selected,
    onSelectionChange,
    className,
}: DietaryPreferencesProps) {
    const togglePreference = (id: string) => {
        if (selected.includes(id)) {
            onSelectionChange(selected.filter((s) => s !== id));
        } else {
            onSelectionChange([...selected, id]);
        }
    };

    return (
        <div className={cn("space-y-4", className)}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {DIETARY_OPTIONS.map((option, index) => {
                    const isSelected = selected.includes(option.id);

                    return (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => togglePreference(option.id)}
                            className={cn(
                                "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 group animate-fade-in",
                                isSelected
                                    ? "border-primary bg-primary/5 shadow-sm"
                                    : "border-border hover:border-primary/50 hover:bg-accent"
                            )}
                            style={{ animationDelay: `${index * 30}ms` }}
                        >
                            {/* Checkmark indicator */}
                            <div
                                className={cn(
                                    "absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition-all",
                                    isSelected
                                        ? "bg-primary text-primary-foreground scale-100"
                                        : "bg-muted scale-0"
                                )}
                            >
                                <Check className="h-3 w-3" />
                            </div>

                            <span
                                className={cn(
                                    "font-medium text-sm transition-colors",
                                    isSelected ? "text-primary" : "text-foreground"
                                )}
                            >
                                {option.label}
                            </span>

                            {option.description && (
                                <span className="text-xs text-muted-foreground mt-1 text-center leading-tight">
                                    {option.description}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {selected.length > 0 && (
                <p className="text-sm text-muted-foreground">
                    {selected.length} preference{selected.length !== 1 ? 's' : ''} selected
                </p>
            )}
        </div>
    );
}