import { useState } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../services/firebase.js";
import { Heart, Trash2, Edit, Save, X, ChevronDown, ChevronUp } from "lucide-react";
import  MarkdownRenderer from "./MarkdownRenderer.jsx";
import { Link } from "react-router-dom";

export default function RecipeCard({ recipe, onUpdate, onDelete }) {

  const [expandedRecipe, setExpandedRecipe] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [noteContent, setNoteContent] = useState(recipe.userNotes || "");

  const toggleFavorite = async () => {
    try {
      await updateDoc(doc(db, "recipes", recipe.id), {
        isFavorite: !recipe.isFavorite
      });
      
      onUpdate({ ...recipe, isFavorite: !recipe.isFavorite });
    } catch (error) {
      console.error("Error updating favorite status:", error);
    }
  };

  const deleteRecipe = async () => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, "recipes", recipe.id));
      onDelete(recipe.id);
    } catch (error) {
      console.error("Error deleting recipe:", error);
    }
  };

  const saveNotes = async () => {
    try {
      await updateDoc(doc(db, "recipes", recipe.id), {
        userNotes: noteContent
      });
      
      onUpdate({ ...recipe, userNotes: noteContent });
      setEditingNotes(false);
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  };

  const getRecipePreview = (content) => {
    if (!content) return "No preview available";
    
    const cleanContent = content
      .replace(/^#+\s*/gm, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .split('\n')
      .filter(line => line.trim())
      .slice(0, 3)
      .join(' ');
    
    return cleanContent.length > 150 
      ? cleanContent.substring(0, 150) + "..." 
      : cleanContent;
  };

  return (
    <div className="card border border-[var(--color-secondary)]">
      
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h2 className="text-lg md:text-xl font-semibold text-[var(--color-primary)] mb-2">
            {recipe.recipeTitle || "Untitled Recipe"}
          </h2>
          
          
          {recipe.ingredientsList && (

            <div className="flex flex-wrap gap-2 mb-3">

              {recipe.ingredientsList.map((ingredient, idx) => (

                <span 
                  key={idx}
                  className="text-xs bg-[var(--color-bg)] px-2 py-1 rounded-full border border-[var(--color-text-secondary)]"
                >
                  {ingredient}
                </span>

              ))}

            </div>
          )}
          
          
          <div className="text-sm text-[var(--color-text-secondary)]">
            Saved on: {recipe.createdAt?.toDate().toLocaleDateString() || "Unknown date"}
          </div>

        </div>
        
        
        <div className="flex gap-2 ml-4">
          <button
            onClick={toggleFavorite}
            className={`p-1.5 cursor-pointer rounded-full transition ${
              recipe.isFavorite 
                ? 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300' 
                : 'text-gray-400 hover:text-pink-500'
            }`}
            title={recipe.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart size={20} fill={recipe.isFavorite ? "currentColor" : "none"} />
          </button>
          
          <button
            onClick={deleteRecipe}
            className="p-1.5 rounded-full cursor-pointer text-gray-400 hover:text-red-500 transition"
            title="Delete recipe"
          >
            <Trash2 size={20} />
          </button>

        </div>

      </div>
      
      
      {!expandedRecipe && (
        <div className="mb-4 p-3 bg-[var(--color-bg)] rounded-md">

          <p className="text-sm text-[var(--color-text-secondary)]">
            {getRecipePreview(recipe.recipeContent)}
          </p>

        </div>
      )}
      
      
      <button
        onClick={() => setExpandedRecipe(!expandedRecipe)}
        className="w-full flex items-center justify-center gap-2 py-2 text-[var(--color-secondary)] cursor-pointer hover:text-[var(--color-primary)] transition border-t border-[var(--color-secondary)] mt-3"
      >
        {expandedRecipe ? (
          <>
            <ChevronUp size={20} />
            Hide Recipe
          </>
        ) : (
          <>
            <ChevronDown size={20} />
            View Full Recipe
          </>
        )}
      </button>
      
      
      {expandedRecipe && (
        <div className="mt-4 border-t border-[var(--color-secondary)] pt-4">
          
          <div className="mb-6">
            <MarkdownRenderer content={recipe.recipeContent} />
          </div>
          
          
          <div className="border-t border-[var(--color-secondary)] pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-[var(--color-primary)] flex items-center gap-2">
                <Edit size={16} />
                Your Notes
              </h3>
              
              {!editingNotes && (
                <button
                  onClick={() => setEditingNotes(true)}
                  className="text-[var(--color-accent)] cursor-pointer hover:text-[var(--color-primary)] flex items-center gap-1 text-sm transition"
                >
                  <Edit size={14} />
                  {recipe.userNotes ? "Edit" : "Add Notes"}
                </button>
              )}
            </div>
            
            {editingNotes ? (
              <div className="space-y-3">
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full border rounded-md border-solid border-[var(--color-text-secondary)] p-3 min-h-32 focus:border-[var(--color-primary)] transition resize-none"
                  placeholder="Add your notes about this recipe here..."
                />
                
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingNotes(false);
                      setNoteContent(recipe.userNotes || "");
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--color-text-secondary)] text-[var(--color-text-secondary)] hover:border-[var(--color-text)] hover:text-[var(--color-text)] transition cursor-pointer"
                  >
                    <X size={14} />
                    Cancel
                  </button>
                  
                  <button
                    onClick={saveNotes}
                    className="flex cursor-pointer items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--button-hover-primary)] transition"
                  >
                    <Save size={14} />
                    Save Notes
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[var(--color-bg)] p-4 rounded-md border border-[var(--color-text-secondary)] min-h-20">
                {recipe.userNotes ? (
                  <div className="whitespace-pre-wrap text-sm md:text-base text-[var(--color-text)]">
                    {recipe.userNotes}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-12">
                    <span className="text-[var(--color-text-secondary)] italic text-sm">
                      No notes yet - click "Add Notes" to add your thoughts
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}