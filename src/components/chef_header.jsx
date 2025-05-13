import MasterChefClaude from "../assets/masterChef_claude.jsx";
import { useState, useEffect } from "react";
import { auth } from "../services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import AuthModal from "./auth/authmodal.jsx";
import { Sun, Moon, Menu, X } from "lucide-react";

export default function ChefHeader(){

    // Authentication states
    const [user, setUser] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState("signin"); // signin or signup
    const [isScrolled, setIsScrolled] = useState(false)
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    }


    return (

        <header className="flex flex-col relative">
            <div className="flex justify-between p-4 h-[85px] bg-[var(--card-bg)] cursor-default">

                <div className="flex items-center gap-4">
                    <a href="/" >
                        <MasterChefClaude />
                    </a>
                    
                    <a href="/" className="hover:text-[color:var(--color-secondary)]">
                        <h1 className="color-[var(--color-text)] text-2xl md:text-3xl">MasterChef Claude</h1>
                    </a>
                </div>

                {/* Mobile menu button - only visible on small screens */}
                <div className="md:hidden flex items-center">
                    <button 
                        onClick={toggleMobileMenu}
                        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                        className="p-2 text-[var(--color-text)] cursor-pointer"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Desktop menu - hidden on small screens */}
                <div className="hidden md:flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-[var(--color-secondary)] ml-10 hover:underline">
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
                        className="btn-accent btn-hover py-2.5">
                            {isDarkMode ? (
                                <Sun size={20} />
                            ) : (
                                <Moon size={20}/>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-[85px] left-0 right-0 bg-[var(--color-bg)] shadow-lg z-50 py-4 px-6 flex flex-col gap-4 border-t border-[var(--color-text-secondary)]">
                    {user ? (
                        <>
                            <span className="text-[var(--color-secondary)] text-center font-semibold hover:underline cursor-default">
                                Hello, {user.email?.split("@")[0] || "Chef"}
                            </span>

                            <button
                                onClick={handleLogut} 
                                className="btn-accent w-full">
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => openAuthModal("signin")}
                                className="btn-accent w-full">
                                Sign In
                            </button>

                            <button
                                onClick={() => openAuthModal("signup")}
                                className="btn-primary w-full mt-2">
                                Sign Up
                            </button>
                        </>
                    )}
                    
                    <button
                        onClick={toggleDarkMode}
                        className="btn-accent w-full mt-2 flex justify-center items-center ">
                        {isDarkMode ? (
                            <>
                                <Sun size={20} className="mr-2" /> Light Mode
                            </>
                        ) : (
                            <>
                                <Moon size={20} className="mr-2" /> Dark Mode
                            </>
                        )}
                    </button>
                </div>
            )}

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