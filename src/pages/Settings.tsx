
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, Moon, Sun, User, Shield, Database, Bell, Key } from 'lucide-react';
import { DatabaseSettings } from '@/components/settings/DatabaseSettings';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [groqKey, setGroqKey] = useState(localStorage.getItem('groqApiKey') || '');
  const [showGroqKey, setShowGroqKey] = useState(false);

  const handleSaveGroqKey = () => {
    localStorage.setItem('groqApiKey', groqKey);
    toast({
      title: "GROQ API Key Saved",
      description: "Your GROQ API key has been saved successfully.",
    });
  };

  return (
    <div className="container mx-auto p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <SettingsIcon className="h-8 w-8 text-primary animate-pulse" />
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="mb-8 w-full flex justify-start overflow-x-auto pb-2">
          <TabsTrigger value="appearance" className="flex items-center gap-2 hover-scale">
            {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span>Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2 hover-scale">
            <User className="h-4 w-4" />
            <span>Account</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2 hover-scale">
            <Database className="h-4 w-4" />
            <span>Database</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2 hover-scale">
            <Key className="h-4 w-4" />
            <span>API Keys</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 hover-scale">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 hover-scale">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="animate-fade-in">
          <Card className="p-6 glass">
            <h2 className="text-2xl font-bold mb-6 gradient-text">Appearance Settings</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Dark Mode</h3>
                  <p className="text-sm text-muted-foreground">Toggle between light and dark mode</p>
                </div>
                <Switch 
                  checked={theme === 'dark'} 
                  onCheckedChange={toggleTheme} 
                  className="hover-scale"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Reduce Motion</h3>
                  <p className="text-sm text-muted-foreground">Disable animations and transitions</p>
                </div>
                <Switch className="hover-scale" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">High Contrast</h3>
                  <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
                </div>
                <Switch className="hover-scale" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Glass Effects</h3>
                  <p className="text-sm text-muted-foreground">Enable glass morphism effects</p>
                </div>
                <Switch defaultChecked className="hover-scale" />
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-4">
              <Button variant="outline" className="hover-scale">Reset to Defaults</Button>
              <Button className="hover-scale">Save Changes</Button>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="account" className="animate-fade-in">
          <Card className="p-6 glass">
            <h2 className="text-2xl font-bold mb-6 gradient-text">Account Settings</h2>
            <p className="text-muted-foreground mb-4">Manage your account settings and preferences</p>
            
            {/* Account settings content would go here */}
            <div className="p-8 text-center">
              <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium">Account Settings</h3>
              <p className="text-sm text-muted-foreground">Coming soon...</p>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="database" className="animate-fade-in">
          <DatabaseSettings />
        </TabsContent>
        
        <TabsContent value="api" className="animate-fade-in">
          <Card className="p-6 glass">
            <h2 className="text-2xl font-bold mb-6 gradient-text">API Key Settings</h2>
            <p className="text-muted-foreground mb-4">Manage your API keys for external services</p>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">GROQ API Key</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure your GROQ API key for AI-powered features.
                  <a href="https://console.groq.com/keys" className="text-primary ml-1 hover:underline" target="_blank" rel="noopener noreferrer">
                    Get your API key
                  </a>
                </p>
                
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <div className="relative">
                      <Input
                        type={showGroqKey ? "text" : "password"}
                        value={groqKey}
                        onChange={(e) => setGroqKey(e.target.value)}
                        placeholder="Enter your GROQ API key here"
                        className="pr-20"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="absolute right-0 top-0 h-full px-3 text-xs"
                        onClick={() => setShowGroqKey(!showGroqKey)}
                      >
                        {showGroqKey ? "Hide" : "Show"}
                      </Button>
                    </div>
                  </div>
                  <Button onClick={handleSaveGroqKey}>
                    Save
                  </Button>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-2">Other API Keys</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add other API keys for additional services and integrations
                </p>
                
                <div className="p-8 text-center">
                  <Key className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Additional API Keys</h3>
                  <p className="text-sm text-muted-foreground">Coming soon...</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="animate-fade-in">
          <Card className="p-6 glass">
            <h2 className="text-2xl font-bold mb-6 gradient-text">Notification Settings</h2>
            <p className="text-muted-foreground mb-4">Manage how you receive notifications</p>
            
            {/* Notification settings content would go here */}
            <div className="p-8 text-center">
              <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium">Notification Settings</h3>
              <p className="text-sm text-muted-foreground">Coming soon...</p>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="animate-fade-in">
          <Card className="p-6 glass">
            <h2 className="text-2xl font-bold mb-6 gradient-text">Security Settings</h2>
            <p className="text-muted-foreground mb-4">Manage your account security and privacy</p>
            
            {/* Security settings content would go here */}
            <div className="p-8 text-center">
              <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium">Security Settings</h3>
              <p className="text-sm text-muted-foreground">Coming soon...</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
