import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebase";
import { addUser } from "../../services/userConfig";
import { useNavigate, useLocation } from "react-router-dom";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect") || "/";

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmedPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      let username = email.split("@")[0];
      const userData = {
        userEmail: user.email,
        username,
        createdAt: new Date()
      };
      await addUser(user.uid, userData);
      navigate(redirect, { replace: true });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-6">
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      <div>
        <label className="block text-[var(--color-text)] mb-2" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="your@email.com"
          className="w-full border rounded-md border-solid outline-none border-[var(--color-text-secondary)] px-3 py-2 focus:border-[var(--color-primary)] transition"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
      </div>
      <div>
        <label className="block text-[var(--color-text)] mb-2" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="password"
          className="w-full border rounded-md border-solid outline-none border-[var(--color-text-secondary)] px-3 py-2 focus:border-[var(--color-primary)] transition"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-[var(--color-text)] mb-2" htmlFor="confirm-password">
          Confirm Password
        </label>
        <input
          id="confirm-password"
          type="password"
          placeholder="confirm password"
          className="w-full border rounded-md border-solid outline-none border-[var(--color-text-secondary)] px-3 py-2 focus:border-[var(--color-primary)] transition"
          value={confirmedPassword}
          onChange={(e) => setConfirmedPassword(e.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        className="w-full btn-primary btn-hover py-2 rounded-md text-lg font-semibold"
        disabled={loading}
      >
        {loading ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  );
}