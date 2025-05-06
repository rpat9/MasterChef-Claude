import SignInForm from "./signin_form"
import SignUpForm from "./signup_form"
import { X } from "lucide-react";

export default function AuthModal({ mode, onClose, onSwitchMode }){
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">

            <div className="bg-[var(--card-bg)] p-6 rounded-lg shadow-lg w-full max-w-md">

                <div className="flex justify-between items-center mb-4">

                    <h2 className="text-xl font-bold text-[var(--color-secondary)]">
                        {mode === "signin" ? "Sign In" : "Sign Up"}
                    </h2>

                    <button 
                    onClick={onClose}
                    className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] text-xl"
                    >
                        <X />
                    </button>

                </div>

                {mode === "signin" ? (
                    <SignInForm onClose={onClose} />
                ) : (
                    <SignUpForm onClose={onClose} onSwitchMode={onSwitchMode} />
                )}

                <div className="mt-4 text-center">
                    
                    <button 
                    onClick={onSwitchMode}
                    className="text-[var(--color-accent)] hover:underline"
                    >
                        {mode === "signin" ?
                        "Need an account? Sign Up" : 
                        "Already have an account? Sign In"}

                    </button>

                </div>
            </div>
        </div>
    )
}