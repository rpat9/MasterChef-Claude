import { Link } from 'react-router-dom';
import { ChefHat, ArrowRight, Sparkles, Clock, Bookmark } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Header } from '../components/layout/Header';

const features = [
    {
        icon: Sparkles,
        title: 'AI-Powered Recipes',
        description: 'Get personalized recipe recommendations based on your ingredients and preferences.',
    },
    {
        icon: Clock,
        title: 'Quick & Easy',
        description: 'Find recipes that match your available time and cooking skill level.',
    },
    {
        icon: Bookmark,
        title: 'Save Favorites',
        description: 'Build your personal cookbook by saving recipes you love.',
    },
];

const Index = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            {/* Hero Section */}
            <section className="flex-1 flex items-center justify-center py-20 px-4">
                <div className="container max-w-5xl">
                    <div className="text-center space-y-8">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage-light text-primary text-sm font-medium animate-fade-in">
                            <Sparkles className="h-4 w-4" />
                            AI-Powered Recipe Discovery
                        </div>

                        {/* Main Heading */}
                        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight animate-fade-in" style={{ animationDelay: '100ms' }}>
                            Turn your ingredients into
                            <span className="block text-primary">delicious meals</span>
                        </h1>

                        {/* Subheading */}
                        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
                            Simply add what's in your kitchen, set your dietary preferences, and let our AI chef create the perfect recipe for you.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
                            <Link to="/auth?mode=signup">
                                <Button size="lg" className="gap-2 text-lg h-12 px-8">
                                    Get Started Free
                                    <ArrowRight className="h-5 w-5" />
                                </Button>
                            </Link>
                            <Link to="/auth">
                                <Button variant="outline" size="lg" className="text-lg h-12 px-8">
                                    Sign In
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-muted/50">
                <div className="container max-w-5xl px-4">
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-12">
                        How it works
                    </h2>

                    <div className="grid sm:grid-cols-3 gap-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;

                            return (
                                <div
                                    key={feature.title}
                                    className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border animate-fade-in"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                        <Icon className="h-7 w-7 text-primary" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-border">
                <div className="container flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <ChefHat className="h-4 w-4" />
                    <span>MasterChef — Made with love for home cooks</span>
                </div>
            </footer>
        </div>
    );
};

export default Index;
