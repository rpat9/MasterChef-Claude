import { useState, useEffect } from "react";

export default function IngredientProgress({ ingredientCount }) {

  const requiredIngredients = 5;
  const remainingCount = Math.max(0, requiredIngredients - ingredientCount);
  const progress = Math.min(100, (ingredientCount / requiredIngredients) * 100);
  
  const [showWelcome, setShowWelcome] = useState(true);
  

  useEffect(() => {
    if (ingredientCount > 0) {
      setShowWelcome(false);
    }
  }, [ingredientCount]);


  return (
    <div className="w-full max-w-3xl mx-auto mt-4 mb-6">

      {showWelcome && ingredientCount === 0 && (
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4">

          <h3 className="font-bold text-lg mb-2">Welcome to MasterChef Claude!</h3>

          <p>Add at least 5 ingredients to generate a delicious recipe. What ingredients do you have on hand?</p>

        </div>
      )}
      
      <div className="mb-2 flex justify-between items-center">

        <span className="text-sm font-medium">Progress: {ingredientCount}/5 ingredients</span>

        {remainingCount > 0 ? (
          <span className="text-sm text-orange-600 font-medium">
            Add {remainingCount} more {remainingCount === 1 ? 'ingredient' : 'ingredients'} to unlock recipe generation
          </span>

        ) : (
          <span className="text-sm text-green-600 font-medium">Ready to generate a recipe!</span>
        )}
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5">

        <div 
          className="bg-orange-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }}
        ></div>

      </div>

    </div>
    
  );
}