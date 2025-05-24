import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import { useNavigate, useLocation } from "react-router-dom";
import RecipeCard from "./RecipeCard.jsx";
import LoadingSpinner from "./LoadingSpinner.jsx";
import EmptyState from "./EmptyState.jsx";

export default function SavedRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      console.log("Auth state changed:", currentUser?.uid);
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

  useEffect(() => {
    if (user) {
      fetchRecipes(user.uid);
    }
  }, [location.pathname, user]);

  const fetchRecipes = async (userId) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching recipes for user:", userId);
      
      const q = query(
        collection(db, "recipes"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      console.log("Query snapshot size:", querySnapshot.size);

      const recipesList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log("Recipe data:", { id: doc.id, ...data });
        return {
          id: doc.id,
          ...data
        };
      });

      console.log("Fetched recipes:", recipesList);
      setRecipes(recipesList);

    } catch (error) {
      console.error("Error fetching recipes:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeUpdate = (updatedRecipe) => {
    setRecipes(recipes.map(recipe => 
      recipe.id === updatedRecipe.id ? updatedRecipe : recipe
    ));
  };

  const handleRecipeDelete = (recipeId) => {
    setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
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

        {error && (
          <div className="card border-red-500 bg-red-50 dark:bg-red-900/20 mb-4">
            <p className="text-red-600 dark:text-red-400">
              Error loading recipes: {error}
            </p>
            <button 
              onClick={() => fetchRecipes(user.uid)}
              className="mt-2 btn-primary btn-hover"
            >
              Try Again
            </button>
          </div>
        )}

        {loading ? (
          <LoadingSpinner message="Loading your recipes..." />
        ) : recipes.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {recipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onUpdate={handleRecipeUpdate}
                onDelete={handleRecipeDelete}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}