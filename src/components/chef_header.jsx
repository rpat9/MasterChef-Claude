import MasterChefClaude from "../assets/masterChef_claude.jsx";
import { useState, useEffect } from "react";
import { auth } from "../services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import AuthModal from "./auth/authmodal.jsx";
import { Sun, Moon } from "lucide-react";

export default function ChefHeader(){

    // Authentication states
    const [user, setUser] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState("signin"); // signin or signup
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
    
        const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setIsDarkMode(darkModePreference);
        
        if (darkModePreference) {
          document.documentElement.classList.add("dark");
        }
        
        const handleScroll = () => {
          setIsScrolled(window.scrollY > 10);
        };
        
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
      }, []);

      const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle("dark");
      };
    
    useEffect(()=>{
        const unsubscribe = onAuthStateChanged(auth, (currentUser) =>{
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    // Login and Logouts
    const handleLogut = async() => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    }


    const openAuthModal = (mode) => {
        setAuthMode(mode);
        setShowAuthModal(true);
    }


    return (

        <header className="flex justify-between p-4 h-[85px] bg-[var(--color-bg)] cursor-default text-[var(--color-primary)]" style={{boxShadow: "0px 1px 3px 0px rgba(0, 0, 0, 0.10), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)"}}>

            <div className="flex items-center gap-4">

                <MasterChefClaude />
                
                <h1 className=" !font-normal">MasterChef Claude</h1>

            </div>

            <div className="flex items-center gap-4">

                {user ? (
                    <div className="flex items-center gap-4">

                        <span className="text-[var(--color-secondary)] ml-10">
                            Hello, {user.email?.split("@")[0] || "Chef"}
                        </span>

                        <button
                        onClick={handleLogut} 
                        className="btn-accent btn-hover">
                            Sign Out
                        </button>

                    </div>
                ) : (
                    <>

                        <button
                        onClick={() => openAuthModal("signin")}
                        className="btn-accent btn-hover">
                            Sign In
                        </button>

                        <button
                        onClick={() => openAuthModal("signup")}
                        className="btn-primary btn-hover">
                            Sign Up
                        </button>

                    </>
                )}

                <div className="flex items-center gap-4">
                    <button
                    onClick={toggleDarkMode}
                    className="btn-accent btn-hover">
                        {isDarkMode ? (
                            <Sun size={20} />
                        ) : (
                            <Moon size={20}/>
                        )}
                    </button>
                </div>
            </div>


            {showAuthModal && (
                <AuthModal 
                    mode={authMode}
                    onClose={() => setShowAuthModal(false)}
                    onSwitchMode={() => setAuthMode(authMode === "signin" ? "signup" : "signin")}
                />
            )}
        </header>
    )
}