import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../services/firebase.js";
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { addUser } from "../services/userConfig.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(false); // For sign-in/sign-up operations

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signIn = async (email, password) => {
        setAuthLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            setAuthLoading(false);
        }
    };

    const signUp = async (email, password) => {
        setAuthLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Create user profile
            const username = email.split("@")[0];
            const userData = {
                userEmail: user.email,
                username,
                createdAt: new Date()
            };
            
            await addUser(user.uid, userData);
            return { success: true, user };
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            setAuthLoading(false);
        }
    };

    const handleSignOut = async () => {
        setAuthLoading(true);
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            console.error("Error signing out:", error);
            return { success: false, error: error.message };
        } finally {
            setAuthLoading(false);
        }
    };

    const value = {
        user,
        loading,
        authLoading,
        signIn,
        signUp,
        signOut: handleSignOut
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}