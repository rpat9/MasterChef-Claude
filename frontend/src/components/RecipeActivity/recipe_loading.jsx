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
        
        const stageTimer = setInterval(() => {
            setLoadingStage((prevStage) => {
              if (prevStage < 4) {
                return prevStage + 1;
              } else {
                return 1;
              }
            });
          }, 2300); 
        
          return () => {
            clearInterval(tipTimer);
            clearInterval(stageTimer);
          };

      }, []);

      return (
        <div className="loading-container px-4 md:px-0">
            <div className="loading-spinner-container">
                <div className="loading-spinner"></div>
                    <span className="loading-message text-sm md:text-lg">
                    {loadingMessages[loadingStage - 1]}
                    </span>
            </div>
      
            <div className="loading-progress-track w-full md:w-3/4 lg:w-full">
                <div 
                className="loading-progress-fill" 
                style={{ width: `${loadingStage * 25}%` }}
                ></div>
            </div>
      
            <div className="chef-tip-container w-full md:w-3/4 lg:w-full">
                <p className="chef-tip-label text-xs md:text-sm">Chef's Tip While You Wait:</p>
                <p className="chef-tip-text text-xs md:text-sm">{loadingTip}</p>
            </div>
        </div>
      )

}