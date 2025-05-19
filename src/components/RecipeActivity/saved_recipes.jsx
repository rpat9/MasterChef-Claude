import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import ReactMarkdown from "react-markdown";
import { BookmarkCheck, BookmarkX, Trash2, Edit, Heart, Save, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function SavedRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [expandedRecipe, setExpandedRecipe] = useState(null);
  const [editingNotes, setEditingNotes] = useState(null);
  const [noteContent, setNoteContent] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchRecipes(currentUser.uid);
      } else {
        setRecipes([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchRecipes = async (userId) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "recipes"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);

      const recipesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setRecipes(recipesList);

    } catch (error) {

      console.error("Error fetching recipes:", error);

    } finally {
      setLoading(false);
    }
  };


  const toggleFavorite = async (recipeId, currentStatus) => {

    try {
      await updateDoc(doc(db, "recipes", recipeId), {
        isFavorite: !currentStatus
      });
      
      setRecipes(recipes.map(recipe => 
        recipe.id === recipeId 
          ? { ...recipe, isFavorite: !currentStatus } 
          : recipe
      ));

    } catch (error) {

      console.error("Error updating favorite status:", error);
    }

  };

  const deleteRecipe = async (recipeId) => {

    if (!window.confirm("Are you sure you want to delete this recipe?")) {
      return;
    }
    
    try {

      await deleteDoc(doc(db, "recipes", recipeId));
      
      setRecipes(recipes.filter(recipe => recipe.id !== recipeId));

    } catch (error) {

      console.error("Error deleting recipe:", error);

    }
  };


  const startEditingNotes = (recipeId, currentNotes) => {
    setEditingNotes(recipeId);
    setNoteContent(currentNotes || "");
  };

  const saveNotes = async (recipeId) => {

    try {
      await updateDoc(doc(db, "recipes", recipeId), {
        userNotes: noteContent
      });
      
      // Update local state
      setRecipes(recipes.map(recipe => 
        recipe.id === recipeId 
          ? { ...recipe, userNotes: noteContent } 
          : recipe
      ));
      
      setEditingNotes(null);

    } catch (error) {

      console.error("Error saving notes:", error);

    }
  };

  const toggleRecipe = (recipeId) => {
    setExpandedRecipe(expandedRecipe === recipeId ? null : recipeId);
  };

  if (!user) {
    return (
      <div className="pt-8 pb-4 px-4 md:px-8 max-w-3xl mx-auto text-center">
        <div className="card">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-[var(--color-primary)]">
            Saved Recipes
          </h2>
          <p className="mb-4">Please sign in or sign up to view your saved recipes.</p>
          <div className="flex flex-col md:flex-row gap-2 justify-center">
            <button
              className="btn-primary btn-hover"
              onClick={() => navigate(`/signin?redirect=${encodeURIComponent(location.pathname)}`)}
            >
              Sign In
            </button>
            <button
              className="btn-accent btn-hover"
              onClick={() => navigate(`/signup?redirect=${encodeURIComponent(location.pathname)}`)}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="pt-8 pb-4 px-4 md:px-8">

      <div className="max-w-3xl mx-auto">
        
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-[var(--color-primary)] text-center">
          My Saved Recipes
        </h1>

        {loading ? (
          <div className="card text-center p-8">
            <div className="w-12 h-12 border-4 border-[var(--color-secondary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading your recipes...</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="card text-center p-8">
            <p className="mb-4">You haven't saved any recipes yet.</p>
            <a href="/" className="btn-primary btn-hover inline-block">
              Create a new recipe
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {recipes.map(recipe => (
              <div 
                key={recipe.id} 
                className="card border border-[var(--color-secondary)]"
              >
                <div className="flex justify-between items-center mb-3">
                  <h2 
                    className="text-lg md:text-xl font-semibold text-[var(--color-primary)] cursor-pointer hover:underline"
                    onClick={() => toggleRecipe(recipe.id)}
                  >
                    {recipe.recipeTitle || "Untitled Recipe"}
                  </h2>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleFavorite(recipe.id, recipe.isFavorite)}
                      className={`p-1.5 rounded-full ${recipe.isFavorite ? 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300' : 'text-gray-400 hover:text-pink-500'}`}
                      aria-label={recipe.isFavorite ? "Remove from favorites" : "Add to favorites"}
                      title={recipe.isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Heart size={20} fill={recipe.isFavorite ? "currentColor" : "none"} />
                    </button>
                    
                    <button
                      onClick={() => deleteRecipe(recipe.id)}
                      className="p-1.5 rounded-full text-gray-400 hover:text-red-500"
                      aria-label="Delete recipe"
                      title="Delete recipe"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {recipe.ingredientsList?.map((ingredient, idx) => (
                    <span 
                      key={idx}
                      className="text-xs bg-[var(--color-bg)] px-2 py-1 rounded-full"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
                
                <div className="text-sm text-[var(--color-text-secondary)]">
                  Saved on: {recipe.createdAt?.toDate().toLocaleDateString() || "Unknown date"}
                </div>
                
                {expandedRecipe === recipe.id && (
                  <div className="mt-4 border-t border-[var(--color-secondary)] pt-4">
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>
                        {recipe.recipeContent}
                      </ReactMarkdown>
                    </div>
                    
                    <div className="mt-6 border-t border-[var(--color-secondary)] pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-[var(--color-primary)]">Your Notes</h3>
                        
                        {editingNotes !== recipe.id && (
                          <button
                            onClick={() => startEditingNotes(recipe.id, recipe.userNotes)}
                            className="text-[var(--color-accent)] flex items-center gap-1 text-sm"
                          >
                            <Edit size={16} />
                            {recipe.userNotes ? "Edit Notes" : "Add Notes"}
                          </button>
                        )}
                      </div>
                      
                      {editingNotes === recipe.id ? (
                        <div>
                          <textarea
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            className="w-full border rounded-sm border-solid border-[var(--color-primary)] p-2 min-h-32"
                            placeholder="Add your notes about this recipe here..."
                          />
                          
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              onClick={() => setEditingNotes(null)}
                              className="flex items-center gap-1 px-3 py-1 rounded-lg border border-[var(--color-text-secondary)]"
                            >
                              <X size={16} />
                              Cancel
                            </button>
                            
                            <button
                              onClick={() => saveNotes(recipe.id)}
                              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[var(--color-primary)] text-white"
                            >
                              <Save size={16} />
                              Save Notes
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[var(--color-bg)] p-3 rounded min-h-16">
                          {recipe.userNotes ? 
                            recipe.userNotes : 
                            <span className="text-[var(--color-text-secondary)] italic">No notes yet</span>
                          }
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}