import { useAuth } from "../../Contexts/AuthContext.jsx";

export function UserGreeting() {
    const { user } = useAuth();
    
    if (!user) return null;

    return (
        <span className="text-[var(--color-secondary)] hover:underline">
            Hello, {user.email?.split("@")[0] || "Chef"}
        </span>
    );
}