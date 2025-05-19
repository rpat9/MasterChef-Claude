import SignUpForm from "../components/auth/signup_form";
import { Link } from "react-router-dom";

export default function SignUpPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-[var(--color-bg)]">
      <div className="bg-[var(--card-bg)] rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-6 text-center">Sign Up</h2>
        <SignUpForm />
        <div className="mt-4 text-center">
          <span className="text-[var(--color-text-secondary)]">Already have an account?</span>
          <Link to="/signin" className="ml-2 text-[var(--color-accent)] hover:underline">Sign In</Link>
        </div>
      </div>
    </div>
  );
}