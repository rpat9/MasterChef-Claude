import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../Contexts/ThemeContext.jsx";

export function ThemeToggle({ showLabel = false }) {
    const { isDarkMode, toggleDarkMode } = useTheme();

    return (
        <button
            onClick={toggleDarkMode}
            className="btn-accent btn-hover py-2.5 flex justify-center items-center"
        >
            {isDarkMode ? (
                <>
                    <Sun size={20} />
                    {showLabel && <span className="ml-2">Light Mode</span>}
                </>
            ) : (
                <>
                    <Moon size={20} />
                    {showLabel && <span className="ml-2">Dark Mode</span>}
                </>
            )}
        </button>
    );
}