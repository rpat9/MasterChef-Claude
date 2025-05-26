import { useState, useEffect } from "react";
import { auth } from "../../services/firebase.js";
import { saveRecipe } from "../../services/saveRecipe.js";
import { BookmarkPlus, Check, LogIn } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer.jsx";
import { toast } from "react-hot-toast";

export default function ClaudeRecipe({ recipe, ingredients }) {
  const [user, setUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  // Extract title from markdown
  const extractTitle = (content) => {
    if (!content) return "Recipe";
    const titleMatch = content.match(/^#\s+(.+)$/m);
    return titleMatch && titleMatch[1] ? titleMatch[1].trim() : "Delicious Recipe";
  };

  const recipeTitle = extractTitle(recipe);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSaveRecipe = async () => {
    if (!user) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }

    setIsSaving(true);
    try {
      await saveRecipe(
        user.uid,
        recipe,
        recipeTitle,
        ingredients
      );
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast.error("Failed to save recipe. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section 
      className="card max-w-3xl mx-auto mt-8 border border-[var(--color-secondary)] px-3 md:px-6" 
      aria-live="polite"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl md:text-2xl font-semibold mb-3 mt-1 text-[color:var(--color-primary)]">
          MasterChef Claude Recommends:
        </h2>
        
        <div className="relative">
          <button
            onClick={handleSaveRecipe}
            disabled={isSaving || isSaved}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[var(--button-text-color)] transition ${
              isSaved 
                ? "bg-green-500 hover:bg-green-600" 
                : "bg-[var(--color-accent)] hover:bg-[var(--button-hover-accent)]"
            } btn-hover`}
            aria-label={isSaved ? "Recipe saved" : "Save this recipe"}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </span>
            ) : isSaved ? (
              <span className="flex items-center gap-2">
                <Check size={16} />
                Saved!
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <BookmarkPlus size={16} />
                Save Recipe
              </span>
            )}
          </button>
          
          {showLoginPrompt && (
            <div className="absolute right-0 top-12 bg-[var(--card-bg)] border border-[var(--color-primary)] p-3 rounded-md shadow-lg w-48 z-10">
              <p className="text-sm flex items-center gap-2">
                <LogIn size={16} />
                Please log in to save recipes
              </p>
            </div>
          )}
        </div>
      </div>
      
      <MarkdownRenderer content={recipe} />
    </section>
  );
}