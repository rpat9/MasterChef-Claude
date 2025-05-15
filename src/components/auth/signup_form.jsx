import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebase";
import { addUser } from "../../services/userConfig";

export default function SignUpForm({ onClose, onSwitchMode }) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmedPassword, setConfirmedPassword] = useState("");
    const [error, setError] = useState("");

    const handleSignup = async(e) => {

        e.preventDefault();

        setError("");

        if (password !== confirmedPassword) {
            setError("Passwords do not match");
            return;
        }

        try{
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            let username = '';

            if(email){
                username = email.split('@')[0];
            }

            const userData = {
                userEmail: user.email,
                username: username,
                createdAt: new Date()
            }

            await addUser(user.uid, userData);
            
            onClose();
            
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <form onSubmit={handleSignup}>

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

            <div className="mb-4">
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

            <div className="mb-6">

                <label className="block text-[var(--color-text)] mb-2" htmlFor="confirm-password">
                    Confirm Password
                </label>

                <input
                    id="confirm-password"
                    type="password"
                    placeholder="confirm password"
                    className="w-full border rounded-sm border-solid outline-[1px] border-[var(--color-text-secondary)] px-3 py-2"
                    value={confirmedPassword}
                    onChange={(e) => setConfirmedPassword(e.target.value)}
                    required
                />

            </div>
            
            <button 
                type="submit"
                className="w-full btn-primary btn-hover"
            >
                Create Account
            </button>
        </form>
    );

}