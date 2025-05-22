// components/Navigation.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { UserGreeting } from "./UserGreeting";
import { AuthButtons } from "./AuthButtons";
import { ThemeToggle } from "./ThemeToggle";

export function Navigation({ isMobile = false }) {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;
    
    const baseClasses = isMobile ? "text-center btn-hover" : "btn-hover";

    return (
        <nav className="flex items-center">
            <Link
                to="/saved-recipes"
                className={`btn-primary ${baseClasses}${
                    isActive("/saved-recipes") ? " ring-2 ring-[var(--color-secondary)]" : ""
                }`}
            >
                Saved Recipes
            </Link>
        </nav>
    );
}

export function MobileMenuToggle({ isOpen, onToggle }) {
    return (
        <div className="lg:hidden flex items-center">
            <button
                onClick={onToggle}
                aria-label={isOpen ? "Close menu" : "Open menu"}
                className="p-2 text-[var(--color-text)] cursor-pointer"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>
    );
}

export function MobileMenu({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="lg:hidden absolute top-[85px] left-0 right-0 bg-[var(--color-bg)] shadow-lg z-50 py-4 px-6 flex flex-col gap-4 border-t border-[var(--color-text-secondary)]">
            <UserGreeting />
            <Navigation isMobile />
            <AuthButtons isMobile />
            <ThemeToggle showLabel />
        </div>
    );
}

// Main navigation component that handles both desktop and mobile
export default function NavigationManager() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <>
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-4">
                <UserGreeting />
                <Navigation />
                <AuthButtons />
                <ThemeToggle />
            </div>

            {/* Mobile Menu Toggle */}
            <MobileMenuToggle 
                isOpen={isMobileMenuOpen} 
                onToggle={toggleMobileMenu} 
            />

            {/* Mobile Menu */}
            <MobileMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />
        </>
    );
}