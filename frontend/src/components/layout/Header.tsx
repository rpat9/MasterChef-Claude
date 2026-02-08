import { Link, useLocation } from 'react-router-dom';
import { ChefHat, BookOpen, User, LogOut, Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { cn } from '../../lib/utils';
import { useState } from 'react';

interface HeaderProps {
    isAuthenticated?: boolean;
    userName?: string;
    onLogout?: () => void;
}

export function Header({ isAuthenticated = false, userName, onLogout }: HeaderProps) {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { href: '/dashboard', label: 'Find Recipe', icon: ChefHat },
        { href: '/saved', label: 'Saved Recipes', icon: BookOpen },
        { href: '/profile', label: 'Profile', icon: User },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
            <div className="container flex h-16 items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                        <ChefHat className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <span className="font-display text-xl font-semibold hidden sm:block">
                        MasterChef
                    </span>
                </Link>

                {/* Desktop Navigation */}
                {isAuthenticated && (
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = location.pathname === link.href;

                            return (
                                <Link key={link.href} to={link.href}>
                                    <Button
                                        variant={isActive ? 'secondary' : 'ghost'}
                                        className={cn(
                                            "gap-2",
                                            isActive && "bg-sage-light text-primary"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {link.label}
                                    </Button>
                                </Link>
                            );
                        })}
                    </nav>
                )}

                {/* Right Section */}
                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <>
                            <span className="hidden sm:block text-sm text-muted-foreground">
                                Hi, {userName || 'Chef'}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    // TODO: Implement logout via API
                                    onLogout?.();
                                }}
                                className="hidden md:flex"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>

                            {/* Mobile Menu */}
                            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                                <SheetTrigger asChild className="md:hidden">
                                    <Button variant="ghost" size="icon">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-72">
                                    <div className="flex flex-col gap-4 mt-8">
                                        {navLinks.map((link) => {
                                            const Icon = link.icon;
                                            const isActive = location.pathname === link.href;

                                            return (
                                                <Link
                                                    key={link.href}
                                                    to={link.href}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    <Button
                                                        variant={isActive ? 'secondary' : 'ghost'}
                                                        className={cn(
                                                            "w-full justify-start gap-3",
                                                            isActive && "bg-sage-light text-primary"
                                                        )}
                                                    >
                                                        <Icon className="h-5 w-5" />
                                                        {link.label}
                                                    </Button>
                                                </Link>
                                            );
                                        })}
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-3 text-destructive"
                                            onClick={() => {
                                                // TODO: Implement logout via API
                                                onLogout?.();
                                                setMobileMenuOpen(false);
                                            }}
                                        >
                                            <LogOut className="h-5 w-5" />
                                            Logout
                                        </Button>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/auth">
                                <Button variant="ghost">Sign In</Button>
                            </Link>
                            <Link to="/auth?mode=signup">
                                <Button>Get Started</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
