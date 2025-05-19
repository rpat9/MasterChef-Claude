import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useNavigate, useLocation } from "react-router-dom";

export default function SignInForm() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect") || "/";
  

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(redirect, { replace: true });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-6">
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
      <button
        type="submit"
        className="w-full btn-primary btn-hover py-2 rounded-md text-lg font-semibold"
        disabled={loading}
      >
        {loading ? "Signing In..." : "Sign In"}
      </button>
    </form>
  );
}