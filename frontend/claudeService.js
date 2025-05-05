// Updated to call backend API instead of Claude directly
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export async function getRecipeFromClaude(ingredientsArr) {
  try {
    const response = await fetch(`${API_BASE_URL}/recipes/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ingredients: ingredientsArr }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch recipe');
    }

    const data = await response.json();
    return data.recipe;
  } catch (error) {
    console.error("Error fetching recipe from backend:", error);
    throw error;
  }
}