import { useState } from 'react';
import { Save, User, Settings } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Header } from '../components/layout/Header';
import { DietaryPreferences } from '../components/recipe/DietaryPreferences';
import { useToast } from '../hooks/useToast';

const Profile = () => {
    const { toast } = useToast();

    // Mock user data - replace with actual user state from API
    const [profile, setProfile] = useState({
        name: 'Chef',
        email: 'chef@example.com',
    });
    const [dietaryPreferences, setDietaryPreferences] = useState<string[]>(['vegetarian']);
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveProfile = async () => {
        setIsSaving(true);

        // TODO: Implement profile update via API
        // Example:
        // await api.user.updateProfile({
        //   name: profile.name,
        //   dietaryPreferences,
        // });

        console.log('Save profile:', { profile, dietaryPreferences });

        // Simulating API call
        setTimeout(() => {
            setIsSaving(false);
            toast({
                title: 'Profile updated',
                description: 'Your changes have been saved successfully.',
            });
        }, 1000);
    };

    const handleLogout = () => {
        // TODO: Implement logout via API
        console.log('Logout');
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header
                isAuthenticated={true}
                userName={profile.name}
                onLogout={handleLogout}
            />

            <main className="flex-1 container max-w-2xl py-8 px-4">
                <div className="space-y-8">
                    {/* Page Header */}
                    <div>
                        <h1 className="font-display text-3xl font-bold">Profile</h1>
                        <p className="text-muted-foreground">
                            Manage your account and preferences
                        </p>
                    </div>

                    {/* Personal Info */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">Personal Information</CardTitle>
                            </div>
                            <CardDescription>
                                Update your name and email address
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    placeholder="Your name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={profile.email}
                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                    placeholder="Your email"
                                    disabled
                                />
                                <p className="text-xs text-muted-foreground">
                                    Email cannot be changed
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dietary Preferences */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Settings className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">Default Dietary Preferences</CardTitle>
                            </div>
                            <CardDescription>
                                These preferences will be pre-selected when generating recipes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DietaryPreferences
                                selected={dietaryPreferences}
                                onSelectionChange={setDietaryPreferences}
                            />
                        </CardContent>
                    </Card>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <Button
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            className="gap-2"
                        >
                            <Save className="h-4 w-4" />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
