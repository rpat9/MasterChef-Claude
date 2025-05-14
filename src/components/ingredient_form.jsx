import { useState } from "react";
import IngredientList from "./ingredient_list.jsx";
import ClaudeRecipe from "./claude_recipe.jsx";
import RecipeLoading from "./recipe_loading.jsx";
import { getRecipeFromClaude } from "../services/claudeService.js";
import IngredientProgress from "./ingredient_progress.jsx";

export default function IngredientForm() {

    const [ingredients, setIngredients] = useState([]);
    const [recipe, setRecipe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);



    async function getRecipe(){
        setIsLoading(true);
        try{
            const generatedRecipeMD = await getRecipeFromClaude(ingredients)
            setRecipe(generatedRecipeMD)
        } catch (error) {
            console.error("Error getting the recipe:", error);
        } finally {
            setIsLoading(false);
        }
    }


    function addIngredient(formData){
        const newIngredient = formData.get("ingredient").trim();

        if(!newIngredient){
            alert("Please enter an ingredient");
            return;
        }

        if (ingredients.includes(newIngredient)){
            alert("You already added this ingredient");
            return;

        } else if (!/^[a-zA-Z\s\-]+$/.test(newIngredient)) {
            alert("Please enter a valid ingredient (letters, spaces, and hyphens only)");
            return;
        }

        setIngredients(prevIngredients => [...prevIngredients, newIngredient]);
    }

    
    function handleDelete(ingredientToDelete){
        setIngredients(prevIngredients => 
            prevIngredients.filter(ingredient => ingredient !== ingredientToDelete)
        );
    }


    return (
        <section className="pt-8 pb-4 px-4 md:px-8">

            {ingredients.length === 0 && !recipe && (
                <div className="max-w-3xl mx-auto mb-6 text-center">
                    <IngredientProgress 
                        ingredientCount = {ingredients.length} />
                </div>
            )}

            <form action={addIngredient} className="flex flex-col md:flex-row gap-4 justify-center w-full max-w-3xl min-w-xs mx-auto">

                <input 
                    type="text"
                    placeholder="e.g. oregano"
                    aria-label="Add ingredient button"
                    name="ingredient"
                    className="text-[var(--color-text)] grow border rounded-sm border-solid outline-[1px] border-[var(--color-primary)] px-2 h-10 shadow-md"
                />

                <button type="submit" className="btn-primary btn-hover">+ Add Ingredient</button>

            </form>

            {ingredients.length > 0 && 
                <IngredientList 
                ingredientsArray={ingredients}
                getRecipe={getRecipe} 
                onDeleteIngredient={handleDelete}/>
            }

            {isLoading && (
                <RecipeLoading />
            )}

            {recipe && <ClaudeRecipe recipe={recipe}/>}

        </section>
    )
}