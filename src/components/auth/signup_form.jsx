import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";

export default function SignUpForm() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();

  const { signUp, authLoading, user } = useAuth();
  
  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect") || "/";

  useEffect(() => {
    if (user) {
      navigate(redirect, { replace: true });
    }
  }, [user, navigate, redirect]);

  const handleSignup = async (e) => {

    e.preventDefault();
    setError("");
    
    if (password !== confirmedPassword) {
      setError("Passwords do not match");
      return;
    }
    
    const result = await signUp(email, password);
    
    if (!result.success) {
      setError(result.error);
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
        disabled={authLoading}
      >
        {authLoading ? "Creating Account..." : "Create Account"}
      </button>
      
    </form>
  );
}