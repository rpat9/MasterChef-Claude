import { useState } from "react";
import IngredientList from "./ingredient_list.jsx";
import ClaudeRecipe from "./claude_recipe.jsx";
import RecipeLoading from "./recipe_loading.jsx";
import { getRecipeFromClaude } from "../services/claudeService.js";

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
        <section className="pt-8 pb-4 px-8">

            {ingredients.length === 0 && !recipe && (
                <div className="max-w-3xl mx-auto mb-6 text-center">
                    <h2 className="text-xl text-[var(--color-primary)]">Create your perfect recipe with MasterChef Claude</h2>
                    <p className="text-[var(--color-secondary)]">Add at least 5 ingredients to generate a delicious recipe tailored to what you have available.</p>
                </div>
            )}

            <form action={addIngredient} className="flex gap-4 justify-center w-full max-w-3xl min-w-3xs mx-auto">

                <input 
                    type="text"
                    placeholder="e.g. oregano"
                    aria-label="Add ingredient button"
                    name="ingredient"
                    className="grow border rounded-sm border-solid outline-[1px] border-black px-2 h-10 shadow-md shadow-amber-50"
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