import masterChef_claude from "../assets/masterChef_claude.png"
import { useState, useEffect } from "react";
import { auth } from "../services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import AuthModal from "./auth/authmodal.jsx";

export default function ChefHeader(){

    // Authentication states
    const [user, setUser] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState("signin"); // signin or signup

    
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

        <header className="flex justify-center items-center gap-[11px] h-[85px] !bg-white cursor-default" style={{boxShadow: "0px 1px 3px 0px rgba(0, 0, 0, 0.10), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)"}}>

            <div className="flex items-center gap-4">

                <img className="w-[55px] !bg-white" src={masterChef_claude} alt="MasterChef Claude" />
                
                <h1 className="!bg-white !font-normal">MasterChef Claude</h1>

            </div>

            <div className="flex items-center gap-4">

                {user ? (
                    <div className="flex items-center gap-4">

                        <span className="text-[var(--color-secondary)]">
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