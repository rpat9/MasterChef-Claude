const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL; // This will be dynamic (localhost or AWS URL)

const systemPrompt = `
You are an assistant that receives a list of ingredients that a user has and suggests a recipe they could make with some or all of those ingredients. You don't need to use every ingredient they mention in your recipe. The recipe can include additional ingredients they didn't mention, but try not to include too many extra ingredients. Format your response in markdown to make it easier to render to a web page
`;

export async function getRecipeFromClaude(ingredientsArr){

    const ingredientsString = ingredientsArr.join(", ");

    try{
        const response = await fetch(`${BACKEND_API_URL}/generate-recipe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ingredients: ingredientsString,
                systemPrompt: systemPrompt
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Backend API call failed: ${response.status} ${response.statusText} - ${errorData.message || ''}`);
        }

        const data = await response.json();
        return data.recipe;
        
    } catch (error) {
        console.error("Error fetching recipe from backend:", error);
        throw error;
    }
}