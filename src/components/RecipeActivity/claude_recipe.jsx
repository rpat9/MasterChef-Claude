import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { auth } from "../../services/firebase";
import { saveRecipe } from "../../services/saveRecipe.js";
import { BookmarkPlus, Check, LogIn } from "lucide-react";

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
      alert("Failed to save recipe. Please try again.");
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
      
      <ReactMarkdown className="prose prose-sm md:prose-base lg:prose-lg prose-slate max-w-none"
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl md:text-3xl font-bold mb-4 text-[color:var(--color-primary)]" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl md:text-2xl font-bold mb-3 mt-6 text-[color:var(--color-primary)]" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="text-sm md:text-base leading-relaxed mb-4 text-[color:var(--color-text)]" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside pl-2 md:pl-4 space-y-2 mb-4 marker:text-[color:var(--color-accent)]" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-2 md:pl-4 space-y-2 marker:font-bold marker:text-[color:var(--color-accent)]" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="ml-2 md:ml-3 text-sm md:text-base text-[color:var(--color-text)]" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-[color:var(--color-primary)]" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-[var(--color-text)]" {...props} />
          ),
          code: ({ node, ...props }) => (
            <code className="bg-gray-100 px-1 py-0.5 rounded text-xs md:text-sm text-[var(--color-text)] font-mono" {...props} />
          ),
        }}>
        {recipe}
      </ReactMarkdown>
    </section>
  );
}