import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebase";

export default function Signup() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSignup = async(e) => {
        e.preventDefault();
        try{
            await createUserWithEmailAndPassword(auth, email, password);
            alert("Signup successful");
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <form onSubmit={handleSignup}>
            <input type="email" placeholder="email" onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="password" onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">Signup</button>
        </form>
    );

}