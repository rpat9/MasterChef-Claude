import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { ChefHat, Mail, Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const Auth = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const defaultTab = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
    
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form states
    const [signInForm, setSignInForm] = useState({ email: '', password: '' });
    const [signUpForm, setSignUpForm] = useState({ name: '', email: '', password: '' });

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        // TODO: Implement sign in via API
        // Example:
        // const response = await api.auth.signIn(signInForm.email, signInForm.password);
        // if (response.success) {
        //   navigate('/dashboard');
        // }
        
        console.log('Sign in with:', signInForm);
        
        // Simulating API call
        setTimeout(() => {
            setIsLoading(false);
            navigate('/dashboard');
        }, 1000);
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        // TODO: Implement sign up via API
        // Example:
        // const response = await api.auth.signUp(signUpForm.name, signUpForm.email, signUpForm.password);
        // if (response.success) {
        //   navigate('/dashboard');
        // }
        
        console.log('Sign up with:', signUpForm);
        
        // Simulating API call
        setTimeout(() => {
            setIsLoading(false);
            navigate('/dashboard');
        }, 1000);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-sage-light/20 to-amber-light/20">
            {/* Back to Home */}
            <div className="p-4">
                <Link to="/">
                    <Button variant="ghost" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Button>
                </Link>
            </div>

            {/* Auth Card */}
            <div className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-md animate-scale-in">
                    <CardHeader className="text-center pb-2">
                        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
                            <ChefHat className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <CardTitle className="font-display text-2xl">Welcome to RecipeAI</CardTitle>
                        <CardDescription>
                            Sign in to your account or create a new one
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Tabs defaultValue={defaultTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="signin">Sign In</TabsTrigger>
                                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                            </TabsList>

                            {/* Sign In Tab */}
                            <TabsContent value="signin">
                                <form onSubmit={handleSignIn} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="signin-email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="signin-email"
                                                type="email"
                                                placeholder="chef@example.com"
                                                value={signInForm.email}
                                                onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })}
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="signin-password">Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="signin-password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                value={signInForm.password}
                                                onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                                                className="pl-10 pr-10"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? 'Signing in...' : 'Sign In'}
                                    </Button>
                                </form>
                            </TabsContent>

                            {/* Sign Up Tab */}
                            <TabsContent value="signup">
                                <form onSubmit={handleSignUp} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-name">Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="signup-name"
                                                type="text"
                                                placeholder="Your name"
                                                value={signUpForm.name}
                                                onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })}
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="signup-email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="signup-email"
                                                type="email"
                                                placeholder="chef@example.com"
                                                value={signUpForm.email}
                                                onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="signup-password">Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="signup-password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                value={signUpForm.password}
                                                onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                                                className="pl-10 pr-10"
                                                required
                                                minLength={8}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Must be at least 8 characters
                                        </p>
                                    </div>

                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? 'Creating account...' : 'Create Account'}
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>
                    </CardContent>

                    <CardFooter className="text-center text-sm text-muted-foreground">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default Auth;
