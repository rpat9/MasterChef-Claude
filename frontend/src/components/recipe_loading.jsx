import { useState, useEffect } from "react";

export default function RecipeLoading() {

    const [loadingStage, setLoadingStage] = useState(1);
    const [loadingTip, setLoadingTip] = useState("");

    const loadingMessages = [
        "Warming up the virtual kitchen...",
        "Chef Claude is analzying your ingredients...",
        "Exploring flavor combinations...",
        "Finalizing your perfect recipe..."
    ];

    const cookingTips = [
        "Did you know? Salt doesn't just add saltiness, it enhances all flavors.",
        "Fresh herbs are best added at the end of cooking for maximum flavor.",
        "Room temperature ingredients blend better than cold ones.",
        "Let meat rest after cooking to redistribute the juices.",
        "Taste as you go! The best chefs adjust seasoning throughout cooking."
    ];

    
    useEffect(() => {
        setLoadingTip(cookingTips[Math.floor(Math.random() * cookingTips.length)]);
        
        const tipTimer = setInterval(() => {
          setLoadingTip(cookingTips[Math.floor(Math.random() * cookingTips.length)]);
        }, 4000);
        
        return () => clearInterval(tipTimer);
      }, []);

      return (
        <div className="flex flex-col justify-center items-center my-8 max-w-3xl mx-auto">
            <div className="flex items-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                    <span className="ml-3 text-lg font-medium">
                    {loadingMessages[loadingStage - 1]}
                    </span>
            </div>
      
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-700 ease-out" 
                style={{ width: `${loadingStage * 25}%` }}
                ></div>
            </div>
      
            <div className="mt-2 p-4 bg-amber-50 border border-amber-100 rounded-lg text-center">
                <p className="text-sm text-gray-700 font-medium mb-1">Chef's Tip While You Wait:</p>
                <p className="text-sm italic">{loadingTip}</p>
            </div>
        </div>
      )

}