import TrashIcon from "../assets/trashIcon.jsx"
import IngredientProgress from "./ingredient_progress.jsx"

export default function IngredientList({ ingredientsArray, getRecipe, onDeleteIngredient }){

    const ingredientsList = ingredientsArray.map(ingredient => (
        <li className="bg-orange-500 text-white text-lg font-semibold w-full mb-3 p-2 flex justify-between hover:scale-102 hover:bg-orange-600 transition duration-300 ease-in-out cursor-default" key = {ingredient}> 
            {ingredient}

            <button className="cursor-pointer" 
                aria-label="Remove ingredient button"
                onClick={() => onDeleteIngredient(ingredient)}>

                <div className="w-5 h-5">
                    {TrashIcon}
                </div>
                
            </button>
        </li>
    ));

    return(

        <section>

            <IngredientProgress ingredientCount={ingredientsArray.length} />

            <div className="flex justify-center flex-col items-center">

                <h2 className="block !font-bold text-[1.5em] mt-[0.83em] mb-[0.2em]">Ingredients list: </h2>

                <ul className="mt-2 w-full min-w-3xs max-w-3xl">
                    {ingredientsList}
                </ul>

            </div>

            {ingredientsArray.length >= 5 ? <div className="flex justify-between items-center mt-4 bg-amber-100 border rounded-xl min-w-3xs max-w-3xl p-2 mx-auto w-full">

                <div className="pr-5 pl-5 pb-2">
                    <h3 className="block !font-bold text-[1.17em] mt-[0.83em] mb-[0.1em]">Ready for a recipe?</h3>
                    <p>Generate a recipe from your list of ingredients.</p>
                </div>

                <button onClick={getRecipe} type="submit" className="text-white font-semibold bg-orange-500 cursor-pointer border border-black px-2 h-10 shadow-md rounded hover:scale-105 transition duration-300 ease-in-out">Get a recipe</button>

                </div> : null}

        </section>
        
    )
    
}