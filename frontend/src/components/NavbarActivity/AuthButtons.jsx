import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext.jsx";

export function AuthButtons({ isMobile = false }) {
    const { user, signOut } = useAuth();
    const location = useLocation();
    const baseClasses = isMobile ? "btn-hover w-full" : "btn-hover";

    if (user) {
        return (
            <button
                onClick={signOut}
                className={`btn-accent ${baseClasses}`}
            >
                Sign Out
            </button>
        );
    }

    return (
        <>
            <Link
                to={`/signin?redirect=${encodeURIComponent(location.pathname)}`}
                className={`btn-primary ${baseClasses}`}
            >
                Sign In
            </Link>
            <Link
                to={`/signup?redirect=${encodeURIComponent(location.pathname)}`}
                className={`btn-accent ${baseClasses}`}
            >
                Sign Up
            </Link>
        </>
    );
}