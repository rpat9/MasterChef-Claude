import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export const saveRecipe = async (userId, recipeContent, recipeTitle, ingredientsList) => {

    if (!userId) {
      throw new Error("User must be logged in to save recipes");
    }
  
    try {

      let extractedTitle = recipeTitle;

      if (!extractedTitle && recipeContent) {
        
        const titleMatch = recipeContent.match(/^#\s+(.+)$/m);

        if (titleMatch && titleMatch[1]) {
          extractedTitle = titleMatch[1].trim();
        } else {
          extractedTitle = "Untitled Recipe";
        }
      }
  
      const recipeData = {
        userId,
        createdAt: serverTimestamp(),
        recipeContent,
        recipeTitle: extractedTitle,
        ingredientsList: ingredientsList || [],
        isFavorite: false,
        userNotes: ""
      };
  
      const docRef = await addDoc(collection(db, "recipes"), recipeData);

      console.log("Recipe saved successfully with ID:", docRef.id);

      return docRef.id;

    } catch (error) {
      console.error("Error saving recipe:", error);
      throw error;
    }
};