import TrashIcon from "../assets/trashIcon.jsx"
import IngredientProgress from "./ingredient_progress.jsx"

export default function IngredientList({ ingredientsArray, getRecipe, onDeleteIngredient }){

    const ingredientsList = ingredientsArray.map(ingredient => (
        <li className="bg-[var(--color-primary)] text-[var(--button-text-color)] text-base md:text-lg font-semibold w-full mb-3 p-2 flex justify-between hover:scale-102 hover:bg-[var(--button-hover-primary)] transition duration-300 ease-in-out cursor-default" key = {ingredient}> 
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

                <h2 className="block !font-bold text-[var(--color-primary)] text-lg md:text-[1.5em] mt-[0.83em] mb-[0.2em]">Ingredients list: </h2>

                <ul className="mt-2 w-full min-w-xs md:min-w-3xs max-w-3xl">
                    {ingredientsList}
                </ul>

            </div>

            {ingredientsArray.length >= 5 ? <div className="flex flex-col md:flex-row justify-between items-center mt-4 card border border-[var(--color-secondary)] rounded-xl min-w-xs md:min-w-3xs max-w-3xl p-2 mx-auto w-full">

                <div className="pr-3 md:pr-5 pl-3 md:pl-5 pb-2">
                    <h3 className="block !font-bold text-center md:text-left text-lg md:text-[1.17em] mt-[0.83em] mb-[0.1em] text-[var(--color-primary)]">Ready for a recipe?</h3>
                    <p classname="text-sm md:text-base text-center md:text-left text-[var(--color-text-secondary)]">Generate a recipe from your list of ingredients.</p>
                </div>

                <button onClick={getRecipe} type="submit" className="w-full md:w-auto btn-primary btn-hover my-2 md:my-0">Get a recipe</button>

                </div> : null}

        </section>
        
    )
    
}