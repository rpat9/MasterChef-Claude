import Anthropic from "@anthropic-ai/sdk";

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

const systemPrompt = `
You are an assistant that receives a list of ingredients that a user has and suggests a recipe they could make with some or all of those ingredients. You don't need to use every ingredient they mention in your recipe. The recipe can include additional ingredients they didn't mention, but try not to include too many extra ingredients. Format your response in markdown to make it easier to render to a web page
`;

const anthropic = new Anthropic({
    apiKey: CLAUDE_API_KEY,
    dangerouslyAllowBrowser: true,
});

export async function getRecipeFromClaude(ingredientsArr){

    const ingredientsString = ingredientsArr.join(", ");

    try{
        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1024,
            system: systemPrompt,
            messages: [{ role: "user", content: `I have theseIngredients: ${ingredientsString}. Please give me a recipe you'd recommend I make!` }],
        });

        if (response.content && response.content[0] && response.content[0].text) {
            return response.content[0].text;
        } else{
            throw new Error("Unexpected response from Claude API");
        }
    } catch (error) {
        console.error("Error fetching recipe from Claude API:", error);
        throw error;
    }
}