import MasterChefClaude from "../assets/masterChef_claude.jsx";
import { useState, useEffect } from "react";
import { auth } from "../services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Sun, Moon, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function ChefHeader() {
    // Authentication states
    const [user, setUser] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    
    useEffect(() => {
        const savedMode = localStorage.getItem("theme");
        if (savedMode === "dark") {
            setIsDarkMode(true);
            document.documentElement.classList.add("dark");
        } else {
            setIsDarkMode(false);
            document.documentElement.classList.remove("dark");
        }
    }, []);


    const toggleDarkMode = () => {
        setIsDarkMode(prev => {
            const next = !prev;
            if (next) {
                document.documentElement.classList.add("dark");
                localStorage.setItem("theme", "dark");
            } else {
                document.documentElement.classList.remove("dark");
                localStorage.setItem("theme", "light");
            }
            return next;
        });
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    // Login and Logouts
    const handleLogut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Check if link is active
    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <header className="flex flex-col relative">
            <div className="flex justify-between p-4 h-[85px] bg-[var(--card-bg)] cursor-default">

                <div className="flex items-center gap-2 md:gap-4 max-w-[75%]">
                    <Link to="/" className="flex-shrink-0">
                        <MasterChefClaude />
                    </Link>
                    
                    <Link to="/" className="hover:text-[color:var(--color-secondary)] ">
                        <h1 className="color-[var(--color-text)] text-lg sm:text-2xl md:text-3xl font-bold leading-tight">MasterChef Claude</h1>
                    </Link>
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

                <div className="hidden md:flex items-center gap-4">
                    <nav className="flex items-center mr-1">
                        <Link 
                            to="/saved-recipes"
                            className={`btn-primary btn-hover${isActive("/saved-recipes") ? " ring-2 ring-[var(--color-secondary)]" : ""}`}
                        >
                            Saved Recipes
                        </Link>
                    </nav>

                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-[var(--color-secondary)] ml-10 hover:underline">
                                Hello, {user.email?.split("@")[0] || "Chef"}
                            </span>

                            <button
                                onClick={handleLogut}
                                className="btn-accent btn-hover"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link
                                to={`/signin?redirect=${encodeURIComponent(location.pathname)}`}
                                className="btn-accent btn-hover"
                            >
                                Sign In
                            </Link>
                            <Link
                                to={`/signup?redirect=${encodeURIComponent(location.pathname)}`}
                                className="btn-primary btn-hover"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}

                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleDarkMode}
                            className="btn-accent btn-hover py-2.5"
                        >
                            {isDarkMode ? (
                                <Sun size={20} />
                            ) : (
                                <Moon size={20} />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-[85px] left-0 right-0 bg-[var(--color-bg)] shadow-lg z-50 py-4 px-6 flex flex-col gap-4 border-t border-[var(--color-text-secondary)]">
                    <Link 
                        to="/saved-recipes"
                        className={`btn-primary btn-hover${isActive("/saved-recipes") ? " ring-2 ring-[var(--color-secondary)]" : ""}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Saved Recipes
                    </Link>
                    
                    {user ? (
                        <>
                            <span className="text-[var(--color-secondary)] text-center font-semibold hover:underline cursor-default mt-2">
                                Hello, {user.email?.split("@")[0] || "Chef"}
                            </span>

                            <button
                                onClick={() => {handleLogut(); setIsMobileMenuOpen(false);}}
                                className="btn-accent w-full"
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to={`/signin?redirect=${encodeURIComponent(location.pathname)}`}
                                className="btn-accent w-full mt-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Sign In
                            </Link>
                            <Link
                                to={`/signup?redirect=${encodeURIComponent(location.pathname)}`}
                                className="btn-primary w-full mt-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                    
                    <button
                        onClick={toggleDarkMode}
                        className="btn-accent w-full mt-2 flex justify-center items-center "
                    >
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
        </header>
    );
}