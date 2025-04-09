
import React from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, Moon, Sun, User, Shield, Database, Bell } from 'lucide-react';
import { DatabaseSettings } from '@/components/settings/DatabaseSettings';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();

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
