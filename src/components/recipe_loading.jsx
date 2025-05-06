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
        }, 2000);
        
        return () => clearInterval(tipTimer);
      }, []);

      return (
        <div className="loading-container">
            <div className="loading-spinner-container">
                <div className="loading-spinner"></div>
                    <span className="loading-message">
                    {loadingMessages[loadingStage - 1]}
                    </span>
            </div>
      
            <div className="loading-progress-track">
                <div 
                className="loading-progress-fill" 
                style={{ width: `${loadingStage * 25}%` }}
                ></div>
            </div>
      
            <div className="chef-tip-container">
                <p className="chef-tip-label">Chef's Tip While You Wait:</p>
                <p className="chef-tip-text">{loadingTip}</p>
            </div>
        </div>
      )

}