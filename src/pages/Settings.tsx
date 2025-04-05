
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { User, Mail, Settings as SettingsIcon, Moon, Sun } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/contexts/ThemeContext';

// Settings page component for user profile management and app preferences
const Settings = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setUsername(data.username || '');
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error.message);
      }
    };
    
    fetchProfile();
  }, [user]);
  
  // Update user profile information
  const updateProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          username,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(`Error updating profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle between light and dark mode
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };
  
  if (!user) return null;
  
  return (
    <div className="container max-w-4xl py-10 animate-fade-in">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <SettingsIcon className="h-8 w-8" />
        <span>Settings</span>
      </h1>
      
      <div className="grid gap-8">
        {/* Profile Card */}
        <Card className="hover-lift transition-all duration-300">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your account settings and profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-4 flex-1">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email Address
                  </Label>
                  <Input 
                    id="email" 
                    value={user.email} 
                    disabled 
                    className="bg-muted/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center gap-2">
                    <User className="h-4 w-4" /> Username
                  </Label>
                  <Input 
                    id="username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your preferred username"
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={updateProfile} 
              disabled={loading}
              className="hover-scale"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Appearance Card */}
        <Card className="hover-lift transition-all duration-300">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how the application looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark theme
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Sun className={`h-4 w-4 ${theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`} />
                <Switch 
                  id="dark-mode" 
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                />
                <Moon className={`h-4 w-4 ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
            </div>
            
            <Separator />
            
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Your current theme is: <span className="font-medium text-foreground">{theme === 'dark' ? 'Dark' : 'Light'}</span>
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Account Information */}
        <Card className="hover-lift transition-all duration-300">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Details about your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Account Created</p>
                  <p>{new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Sign In</p>
                  <p>{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }) : 'N/A'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
