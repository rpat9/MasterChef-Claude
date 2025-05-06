import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebase";

export default function SignInForm({ onClose }) {
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSignIn = async(e) => {
        e.preventDefault();
        setError("");

        try{
            await signInWithEmailAndPassword(auth, email, password);
            onClose();
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <form onSubmit={handleSignIn}>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="mb-4">

                <label className="block text-[var(--color-text)] mb-2" htmlFor="email">
                    Email
                </label>
                <input 
                    id="email" 
                    type="email" 
                    placeholder="your@email.com"
                    className="w-full border rounded-sm border-solid outline-[1px] border-[var(--color-text-secondary)] px-3 py-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                    
            </div>

            <div className="mb-6">
                <label className="block text-[var(--color-text)] mb-2" htmlFor="password">
                    Password
                </label>
                <input 
                    id="password" 
                    type="password" 
                    placeholder="password"
                    className="w-full border rounded-sm border-solid outline-[1px] border-[var(--color-text-secondary)] px-3 py-2"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            <button
                type="submit"
                className="w-full btn-primary btn-hover">
                Sign In
            </button>

        </form>
    );
}