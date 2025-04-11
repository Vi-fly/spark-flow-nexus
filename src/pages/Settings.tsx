
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  User, 
  Shield, 
  Database, 
  Bell, 
  Key,
  Languages,
  Monitor,
  Palette,
  Wifi,
  GanttChartSquare,
  Layout,
  Clock,
  Keyboard
} from 'lucide-react';
import { DatabaseSettings } from '@/components/settings/DatabaseSettings';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [groqKey, setGroqKey] = useState(localStorage.getItem('groqApiKey') || '');
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [language, setLanguage] = useState('english');
  const [timezone, setTimezone] = useState('utc');
  const [fontScale, setFontScale] = useState('1');
  const [colorScheme, setColorScheme] = useState('default');
  const [dateFormat, setDateFormat] = useState('mdy');

  const handleSaveGroqKey = () => {
    localStorage.setItem('groqApiKey', groqKey);
    toast({
      title: "GROQ API Key Saved",
      description: "Your GROQ API key has been saved successfully.",
    });
  };

  const handleSavePreferences = () => {
    localStorage.setItem('preferences', JSON.stringify({
      language,
      timezone,
      fontScale,
      colorScheme,
      dateFormat
    }));
    
    toast({
      title: "Preferences Saved",
      description: "Your preferences have been saved successfully.",
    });
    
    // Apply the font scaling
    document.documentElement.style.fontSize = `${parseInt(fontScale) * 100}%`;
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
          <TabsTrigger value="preferences" className="flex items-center gap-2 hover-scale">
            <Palette className="h-4 w-4" />
            <span>Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-2 hover-scale">
            <Layout className="h-4 w-4" />
            <span>Layout</span>
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

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Compact Mode</h3>
                  <p className="text-sm text-muted-foreground">Reduce padding and margins for denser UI</p>
                </div>
                <Switch className="hover-scale" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Custom Accent Color</h3>
                  <p className="text-sm text-muted-foreground">Choose a custom accent color for the UI</p>
                </div>
                <div className="flex space-x-2">
                  {['blue', 'purple', 'green', 'red', 'orange'].map(color => (
                    <button 
                      key={color}
                      className={`w-6 h-6 rounded-full ${
                        color === 'blue' ? 'bg-blue-500' :
                        color === 'purple' ? 'bg-purple-500' :
                        color === 'green' ? 'bg-green-500' :
                        color === 'red' ? 'bg-red-500' :
                        'bg-orange-500'
                      } hover:scale-110 transition-transform`}
                      title={`Set ${color} as accent color`}
                    />
                  ))}
                </div>
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
            
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Profile Information</h3>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="display-name">Display Name</Label>
                    <Input id="display-name" defaultValue="John Doe" />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="john.doe@example.com" />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input id="bio" defaultValue="Software Developer" />
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t">
                <h3 className="text-lg font-medium mb-4">Account Management</h3>
                <div className="space-y-2">
                  <Button variant="outline">Change Password</Button>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </div>
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
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="openai-key">OpenAI API Key</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="openai-key"
                        type="password"
                        placeholder="Enter your OpenAI API key"
                        className="flex-1"
                      />
                      <Button variant="outline">Save</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="google-maps-key">Google Maps API Key</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="google-maps-key"
                        type="password"
                        placeholder="Enter your Google Maps API key"
                        className="flex-1"
                      />
                      <Button variant="outline">Save</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="animate-fade-in">
          <Card className="p-6 glass">
            <h2 className="text-2xl font-bold mb-6 gradient-text">Notification Settings</h2>
            <p className="text-muted-foreground mb-4">Manage how you receive notifications</p>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Email Notifications</h3>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch defaultChecked className="hover-scale" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Push Notifications</h3>
                  <p className="text-sm text-muted-foreground">Receive notifications in your browser</p>
                </div>
                <Switch defaultChecked className="hover-scale" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Task Reminders</h3>
                  <p className="text-sm text-muted-foreground">Get reminded about upcoming tasks</p>
                </div>
                <Switch defaultChecked className="hover-scale" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">New Comment Notifications</h3>
                  <p className="text-sm text-muted-foreground">Get notified when someone comments on your posts</p>
                </div>
                <Switch defaultChecked className="hover-scale" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">System Updates</h3>
                  <p className="text-sm text-muted-foreground">Get notified about system updates and new features</p>
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
        
        <TabsContent value="security" className="animate-fade-in">
          <Card className="p-6 glass">
            <h2 className="text-2xl font-bold mb-6 gradient-text">Security Settings</h2>
            <p className="text-muted-foreground mb-4">Manage your account security and privacy</p>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
                <Switch className="hover-scale" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Session Timeout</h3>
                  <p className="text-sm text-muted-foreground">Automatically logout after period of inactivity</p>
                </div>
                <Select defaultValue="30">
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select timeout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Login History</h3>
                  <p className="text-sm text-muted-foreground">View and manage your login history</p>
                </div>
                <Button variant="outline" className="hover-scale">View History</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Password Requirements</h3>
                  <p className="text-sm text-muted-foreground">Set minimum requirements for passwords</p>
                </div>
                <Button variant="outline" className="hover-scale">Configure</Button>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-4">
              <Button variant="destructive" className="hover-scale">Revoke All Sessions</Button>
              <Button className="hover-scale">Save Changes</Button>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences" className="animate-fade-in">
          <Card className="p-6 glass">
            <h2 className="text-2xl font-bold mb-6 gradient-text">User Preferences</h2>
            <p className="text-muted-foreground mb-4">Customize your application experience</p>
            
            <div className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="language">Language</Label>
                <Select 
                  value={language} 
                  onValueChange={setLanguage}
                >
                  <SelectTrigger id="language" className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                    <SelectItem value="japanese">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select 
                  value={timezone} 
                  onValueChange={setTimezone}
                >
                  <SelectTrigger id="timezone" className="w-full">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
                    <SelectItem value="cst">Central Standard Time (CST)</SelectItem>
                    <SelectItem value="mst">Mountain Standard Time (MST)</SelectItem>
                    <SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="font-scale">Font Size</Label>
                <Select 
                  value={fontScale} 
                  onValueChange={setFontScale}
                >
                  <SelectTrigger id="font-scale" className="w-full">
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.8">Small</SelectItem>
                    <SelectItem value="0.9">Medium-Small</SelectItem>
                    <SelectItem value="1">Normal</SelectItem>
                    <SelectItem value="1.1">Medium-Large</SelectItem>
                    <SelectItem value="1.2">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="color-scheme">Color Scheme</Label>
                <Select 
                  value={colorScheme} 
                  onValueChange={setColorScheme}
                >
                  <SelectTrigger id="color-scheme" className="w-full">
                    <SelectValue placeholder="Select color scheme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Select 
                  value={dateFormat} 
                  onValueChange={setDateFormat}
                >
                  <SelectTrigger id="date-format" className="w-full">
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="ymd">YYYY/MM/DD</SelectItem>
                    <SelectItem value="text">Month DD, YYYY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-4">
              <Button variant="outline" className="hover-scale" onClick={() => {
                setLanguage('english');
                setTimezone('utc');
                setFontScale('1');
                setColorScheme('default');
                setDateFormat('mdy');
                document.documentElement.style.fontSize = '100%';
              }}>
                Reset to Defaults
              </Button>
              <Button className="hover-scale" onClick={handleSavePreferences}>
                Save Changes
              </Button>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="layout" className="animate-fade-in">
          <Card className="p-6 glass">
            <h2 className="text-2xl font-bold mb-6 gradient-text">Layout Settings</h2>
            <p className="text-muted-foreground mb-4">Customize your workspace layout</p>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Compact Sidebar</h3>
                  <p className="text-sm text-muted-foreground">Use a smaller sidebar with icons only</p>
                </div>
                <Switch className="hover-scale" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Fixed Header</h3>
                  <p className="text-sm text-muted-foreground">Keep the header fixed when scrolling</p>
                </div>
                <Switch defaultChecked className="hover-scale" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Show Quick Actions</h3>
                  <p className="text-sm text-muted-foreground">Display quick action buttons in the header</p>
                </div>
                <Switch defaultChecked className="hover-scale" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Tabbed Interface</h3>
                  <p className="text-sm text-muted-foreground">Use tabs for navigation between sections</p>
                </div>
                <Switch className="hover-scale" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Dashboard Layout</h3>
                  <p className="text-sm text-muted-foreground">Choose your preferred dashboard layout</p>
                </div>
                <Select defaultValue="grid">
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select layout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grid</SelectItem>
                    <SelectItem value="list">List</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="masonry">Masonry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-4">
              <Button variant="outline" className="hover-scale">Reset to Defaults</Button>
              <Button className="hover-scale">Save Changes</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
