import { doc, getDoc, setDoc, updateDoc, collection } from "firebase/firestore";
import { db } from "./firebase.js";

export const addUser = async (userId, userData) => {

    /**
     * Adds or updates a user's main profile document in Firestore.
     * The document ID will be the user's UID.
     * @param {string} userId - The unique ID of the user (from Firebase Auth).
     * @param {object} userData - The data to store for the user.
     */
    const userDocRef = doc(db, 'users', userId);

        try {
            await setDoc(userDocRef, userData);
            console.log(`User profile saved successfully for user: ${userId}`);
        } catch (error) {
            console.error("Error saving user profile:", error);
            throw error;
        }

}