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
        <div className="info-banner">

          <h3 className="banner-title">Welcome to MasterChef Claude!</h3>

          <p className="banner-text">Add at least 5 ingredients to generate a delicious recipe. What ingredients do you have on hand?</p>

        </div>
      )}
      
      <div className="progress-header">

        <span className="progress-count">Progress: {ingredientCount}/5 ingredients</span>

        {remainingCount > 0 ? (
          <span className="progress-alert">
            Add {remainingCount} more {remainingCount === 1 ? 'ingredient' : 'ingredients'} to unlock recipe generation
          </span>

        ) : (
          <span className="progress-ready">Ready to generate a recipe!</span>
        )}
      </div>
      
      <div className="progress-track">

        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        ></div>

      </div>

    </div>
    
  );
}