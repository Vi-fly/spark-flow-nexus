import React, { useState, useEffect } from 'react';
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
  Keyboard,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Download,
  Upload
} from 'lucide-react';
import { DatabaseSettings } from '@/components/settings/DatabaseSettings';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { toast as sonnerToast } from 'sonner';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  
  // GROQ API Key settings
  const [groqKey, setGroqKey] = useState(localStorage.getItem('groqApiKey') || '');
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [isSavingGroqKey, setIsSavingGroqKey] = useState(false);
  const [isTestingGroqKey, setIsTestingGroqKey] = useState(false);
  
  // Other API Key settings
  const [openAiKey, setOpenAiKey] = useState(localStorage.getItem('openAiApiKey') || '');
  const [showOpenAiKey, setShowOpenAiKey] = useState(false);
  const [googleMapsKey, setGoogleMapsKey] = useState(localStorage.getItem('googleMapsApiKey') || '');
  const [showGoogleMapsKey, setShowGoogleMapsKey] = useState(false);
  
  // Appearance settings
  const [reduceMotion, setReduceMotion] = useState(localStorage.getItem('reduceMotion') === 'true');
  const [highContrast, setHighContrast] = useState(localStorage.getItem('highContrast') === 'true');
  const [glassEffects, setGlassEffects] = useState(localStorage.getItem('glassEffects') !== 'false');
  const [compactMode, setCompactMode] = useState(localStorage.getItem('compactMode') === 'true');
  const [accentColor, setAccentColor] = useState(localStorage.getItem('accentColor') || 'blue');
  
  // User preferences
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'english');
  const [timezone, setTimezone] = useState(localStorage.getItem('timezone') || 'utc');
  const [fontScale, setFontScale] = useState(localStorage.getItem('fontScale') || '1');
  const [colorScheme, setColorScheme] = useState(localStorage.getItem('colorScheme') || 'default');
  const [dateFormat, setDateFormat] = useState(localStorage.getItem('dateFormat') || 'mdy');

  // Account settings
  const [displayName, setDisplayName] = useState(localStorage.getItem('displayName') || 'John Doe');
  const [email, setEmail] = useState(localStorage.getItem('email') || 'john.doe@example.com');
  const [bio, setBio] = useState(localStorage.getItem('bio') || 'Software Developer');
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  
  // Security settings
  const [twoFactorAuth, setTwoFactorAuth] = useState(localStorage.getItem('twoFactorAuth') === 'true');
  const [sessionTimeout, setSessionTimeout] = useState(localStorage.getItem('sessionTimeout') || '30');
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(localStorage.getItem('emailNotifications') !== 'false');
  const [pushNotifications, setPushNotifications] = useState(localStorage.getItem('pushNotifications') !== 'false');
  const [taskReminders, setTaskReminders] = useState(localStorage.getItem('taskReminders') !== 'false');
  const [commentNotifications, setCommentNotifications] = useState(localStorage.getItem('commentNotifications') !== 'false');
  const [systemUpdates, setSystemUpdates] = useState(localStorage.getItem('systemUpdates') !== 'false');
  
  // Layout settings
  const [compactSidebar, setCompactSidebar] = useState(localStorage.getItem('compactSidebar') === 'true');
  const [fixedHeader, setFixedHeader] = useState(localStorage.getItem('fixedHeader') !== 'false');
  const [showQuickActions, setShowQuickActions] = useState(localStorage.getItem('showQuickActions') !== 'false');
  const [tabbedInterface, setTabbedInterface] = useState(localStorage.getItem('tabbedInterface') === 'true');
  const [dashboardLayout, setDashboardLayout] = useState(localStorage.getItem('dashboardLayout') || 'grid');

  useEffect(() => {
    // Apply font scaling when component mounts or fontScale changes
    document.documentElement.style.fontSize = `${parseInt(fontScale) * 100}%`;
    
    // Apply high contrast if enabled
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    // Apply compact mode if enabled
    if (compactMode) {
      document.documentElement.classList.add('compact-mode');
    } else {
      document.documentElement.classList.remove('compact-mode');
    }
    
    // Apply reduce motion if enabled
    if (reduceMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
    
    // Apply accent color
    document.documentElement.setAttribute('data-accent', accentColor);
  }, [fontScale, highContrast, compactMode, reduceMotion, accentColor]);

  const handleSaveGroqKey = () => {
    setIsSavingGroqKey(true);
    
    // Simulate network delay
    setTimeout(() => {
      localStorage.setItem('groqApiKey', groqKey);
      setIsSavingGroqKey(false);
      
      toast({
        title: "GROQ API Key Saved",
        description: "Your GROQ API key has been saved successfully.",
      });
    }, 800);
  };
  
  const handleTestGroqKey = () => {
    if (!groqKey) {
      toast({
        title: "API Key Required",
        description: "Please enter a GROQ API key to test.",
        variant: "destructive"
      });
      return;
    }
    
    setIsTestingGroqKey(true);
    
    // Simulate API test with delay
    setTimeout(() => {
      setIsTestingGroqKey(false);
      
      // Random success/failure for demo
      const isSuccess = Math.random() > 0.3;
      
      if (isSuccess) {
        toast({
          title: "Connection Successful",
          description: "Your GROQ API key is valid and working correctly.",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Unable to verify your GROQ API key. Please check and try again.",
          variant: "destructive"
        });
      }
    }, 1500);
  };

  const handleSaveOpenAiKey = () => {
    localStorage.setItem('openAiApiKey', openAiKey);
    
    toast({
      title: "OpenAI API Key Saved",
      description: "Your OpenAI API key has been saved successfully.",
    });
  };

  const handleSaveGoogleMapsKey = () => {
    localStorage.setItem('googleMapsApiKey', googleMapsKey);
    
    toast({
      title: "Google Maps API Key Saved",
      description: "Your Google Maps API key has been saved successfully.",
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
    
    // Save individual preferences
    localStorage.setItem('language', language);
    localStorage.setItem('timezone', timezone);
    localStorage.setItem('fontScale', fontScale);
    localStorage.setItem('colorScheme', colorScheme);
    localStorage.setItem('dateFormat', dateFormat);
    
    // Apply the font scaling
    document.documentElement.style.fontSize = `${parseInt(fontScale) * 100}%`;
    
    toast({
      title: "Preferences Saved",
      description: "Your preferences have been saved successfully.",
    });
    
    // Show a more visual confirmation with Sonner toast
    sonnerToast.success("Preferences saved successfully");
  };

  const handleSaveAppearance = () => {
    // Save appearance settings
    localStorage.setItem('reduceMotion', reduceMotion.toString());
    localStorage.setItem('highContrast', highContrast.toString());
    localStorage.setItem('glassEffects', glassEffects.toString());
    localStorage.setItem('compactMode', compactMode.toString());
    localStorage.setItem('accentColor', accentColor);
    
    toast({
      title: "Appearance Settings Saved",
      description: "Your appearance settings have been saved successfully.",
    });
    
    // Show a more visual confirmation with Sonner toast
    sonnerToast.success("Appearance settings saved successfully");
  };

  const handleResetAppearance = () => {
    // Reset to defaults
    setReduceMotion(false);
    setHighContrast(false);
    setGlassEffects(true);
    setCompactMode(false);
    setAccentColor('blue');
    
    // Apply defaults
    localStorage.setItem('reduceMotion', 'false');
    localStorage.setItem('highContrast', 'false');
    localStorage.setItem('glassEffects', 'true');
    localStorage.setItem('compactMode', 'false');
    localStorage.setItem('accentColor', 'blue');
    
    document.documentElement.classList.remove('high-contrast', 'compact-mode', 'reduce-motion');
    document.documentElement.setAttribute('data-accent', 'blue');
    
    toast({
      title: "Appearance Reset",
      description: "Appearance settings have been reset to defaults.",
    });
  };

  const handleSaveAccount = () => {
    setIsSavingAccount(true);
    
    // Simulate network delay
    setTimeout(() => {
      // Save account settings
      localStorage.setItem('displayName', displayName);
      localStorage.setItem('email', email);
      localStorage.setItem('bio', bio);
      
      setIsSavingAccount(false);
      
      toast({
        title: "Account Settings Saved",
        description: "Your account information has been updated successfully.",
      });
    }, 800);
  };

  const handleSaveNotifications = () => {
    // Save notification settings
    localStorage.setItem('emailNotifications', emailNotifications.toString());
    localStorage.setItem('pushNotifications', pushNotifications.toString());
    localStorage.setItem('taskReminders', taskReminders.toString());
    localStorage.setItem('commentNotifications', commentNotifications.toString());
    localStorage.setItem('systemUpdates', systemUpdates.toString());
    
    toast({
      title: "Notification Settings Saved",
      description: "Your notification preferences have been saved successfully.",
    });
  };

  const handleResetNotifications = () => {
    // Reset to defaults
    setEmailNotifications(true);
    setPushNotifications(true);
    setTaskReminders(true);
    setCommentNotifications(true);
    setSystemUpdates(true);
    
    // Apply defaults
    localStorage.setItem('emailNotifications', 'true');
    localStorage.setItem('pushNotifications', 'true');
    localStorage.setItem('taskReminders', 'true');
    localStorage.setItem('commentNotifications', 'true');
    localStorage.setItem('systemUpdates', 'true');
    
    toast({
      title: "Notifications Reset",
      description: "Notification settings have been reset to defaults.",
    });
  };

  const handleSaveSecurity = () => {
    // Save security settings
    localStorage.setItem('twoFactorAuth', twoFactorAuth.toString());
    localStorage.setItem('sessionTimeout', sessionTimeout);
    
    toast({
      title: "Security Settings Saved",
      description: "Your security settings have been updated successfully.",
    });
  };

  const handleSaveLayout = () => {
    // Save layout settings
    localStorage.setItem('compactSidebar', compactSidebar.toString());
    localStorage.setItem('fixedHeader', fixedHeader.toString());
    localStorage.setItem('showQuickActions', showQuickActions.toString());
    localStorage.setItem('tabbedInterface', tabbedInterface.toString());
    localStorage.setItem('dashboardLayout', dashboardLayout);
    
    toast({
      title: "Layout Settings Saved",
      description: "Your layout preferences have been saved successfully.",
    });
    
    // Show visual confirmation with a badge that this might require a reload
    sonnerToast("Layout settings saved", {
      description: "Some changes may require a page reload to take full effect.",
      action: {
        label: "Reload Now",
        onClick: () => window.location.reload()
      },
    });
  };

  const handleResetLayout = () => {
    // Reset to defaults
    setCompactSidebar(false);
    setFixedHeader(true);
    setShowQuickActions(true);
    setTabbedInterface(false);
    setDashboardLayout('grid');
    
    // Apply defaults
    localStorage.setItem('compactSidebar', 'false');
    localStorage.setItem('fixedHeader', 'true');
    localStorage.setItem('showQuickActions', 'true');
    localStorage.setItem('tabbedInterface', 'false');
    localStorage.setItem('dashboardLayout', 'grid');
    
    toast({
      title: "Layout Reset",
      description: "Layout settings have been reset to defaults.",
    });
  };

  const handleExportSettings = () => {
    // Get all settings from localStorage
    const settings = {
      appearance: {
        theme,
        reduceMotion,
        highContrast,
        glassEffects,
        compactMode,
        accentColor
      },
      preferences: {
        language,
        timezone,
        fontScale,
        colorScheme,
        dateFormat
      },
      layout: {
        compactSidebar,
        fixedHeader,
        showQuickActions,
        tabbedInterface,
        dashboardLayout
      },
      notifications: {
        emailNotifications,
        pushNotifications,
        taskReminders,
        commentNotifications,
        systemUpdates
      },
      security: {
        twoFactorAuth,
        sessionTimeout
      }
    };
    
    // Convert to JSON and create a download link
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "settings.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    toast({
      title: "Settings Exported",
      description: "Your settings have been exported successfully.",
    });
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string);
        
        // Apply imported settings
        if (settings.appearance) {
          if (settings.appearance.theme !== theme) toggleTheme();
          setReduceMotion(settings.appearance.reduceMotion);
          setHighContrast(settings.appearance.highContrast);
          setGlassEffects(settings.appearance.glassEffects);
          setCompactMode(settings.appearance.compactMode);
          setAccentColor(settings.appearance.accentColor);
        }
        
        if (settings.preferences) {
          setLanguage(settings.preferences.language);
          setTimezone(settings.preferences.timezone);
          setFontScale(settings.preferences.fontScale);
          setColorScheme(settings.preferences.colorScheme);
          setDateFormat(settings.preferences.dateFormat);
        }
        
        if (settings.layout) {
          setCompactSidebar(settings.layout.compactSidebar);
          setFixedHeader(settings.layout.fixedHeader);
          setShowQuickActions(settings.layout.showQuickActions);
          setTabbedInterface(settings.layout.tabbedInterface);
          setDashboardLayout(settings.layout.dashboardLayout);
        }
        
        if (settings.notifications) {
          setEmailNotifications(settings.notifications.emailNotifications);
          setPushNotifications(settings.notifications.pushNotifications);
          setTaskReminders(settings.notifications.taskReminders);
          setCommentNotifications(settings.notifications.commentNotifications);
          setSystemUpdates(settings.notifications.systemUpdates);
        }
        
        if (settings.security) {
          setTwoFactorAuth(settings.security.twoFactorAuth);
          setSessionTimeout(settings.security.sessionTimeout);
        }
        
        toast({
          title: "Settings Imported",
          description: "Your settings have been imported successfully.",
        });
        
        // Save all the imported settings
        handleSaveAppearance();
        handleSavePreferences();
        handleSaveLayout();
        handleSaveNotifications();
        handleSaveSecurity();
        
        sonnerToast.success("Settings have been imported and applied successfully");
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "There was an error importing your settings.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
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
                <Switch 
                  checked={reduceMotion}
                  onCheckedChange={setReduceMotion}
                  className="hover-scale" 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">High Contrast</h3>
                  <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
                </div>
                <Switch 
                  checked={highContrast}
                  onCheckedChange={setHighContrast}
                  className="hover-scale" 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Glass Effects</h3>
                  <p className="text-sm text-muted-foreground">Enable glass morphism effects</p>
                </div>
                <Switch 
                  checked={glassEffects}
                  onCheckedChange={setGlassEffects}
                  className="hover-scale"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Compact Mode</h3>
                  <p className="text-sm text-muted-foreground">Reduce padding and margins for denser UI</p>
                </div>
                <Switch 
                  checked={compactMode}
                  onCheckedChange={setCompactMode}
                  className="hover-scale" 
                />
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
                      } hover:scale-110 transition-transform ${
                        accentColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                      }`}
                      title={`Set ${color} as accent color`}
                      onClick={() => setAccentColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="hover-scale"
                onClick={handleResetAppearance}
              >
                Reset to Defaults
              </Button>
              <Button 
                className="hover-scale"
                onClick={handleSaveAppearance}
              >
                Save Changes
              </Button>
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
                    <Input 
                      id="display-name" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input 
                      id="bio" 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveAccount}
                  disabled={isSavingAccount}
                >
                  {isSavingAccount ? 
                    <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 
                    <><Save className="mr-2 h-4 w-4" /> Save Changes</>
                  }
                </Button>
              </div>
              
              <div className="pt-6 border-t">
                <h3 className="text-lg font-medium mb-4">Account Management</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Password Settings</h4>
                    <p className="text-muted-foreground text-sm mb-2">Last changed: <span className="font-medium">April 2, 2025</span></p>
                    <div className="mt-2">
                      <Button variant="outline">Change Password</Button>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Account Deletion</h4>
                    <p className="text-muted-foreground text-sm mb-2">This will permanently delete your account and all associated data.</p>
                    <div className="mt-2">
                      <Button variant="destructive">Delete Account</Button>
                    </div>
                  </div>
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
                <div className="flex items-center">
                  <h3 className="text-lg font-medium">GROQ API Key</h3>
                  <Badge variant="outline" className="ml-2">Required</Badge>
                </div>
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
                        {showGroqKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    onClick={handleSaveGroqKey}
                    disabled={isSavingGroqKey}
                  >
                    {isSavingGroqKey ? 
                      <RefreshCw className="h-4 w-4 animate-spin" /> : 
                      "Save"
                    }
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleTestGroqKey}
                    disabled={isTestingGroqKey}
                  >
                    {isTestingGroqKey ? 
                      <RefreshCw className="h-4 w-4 animate-spin" /> : 
                      "Test"
                    }
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
                      <div className="flex-1 relative">
                        <Input
                          id="openai-key"
                          type={showOpenAiKey ? "text" : "password"}
                          placeholder="Enter your OpenAI API key"
                          value={openAiKey}
                          onChange={(e) => setOpenAiKey(e.target.value)}
                          className="pr-20"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          className="absolute right-0 top-0 h-full px-3 text-xs"
                          onClick={() => setShowOpenAiKey(!showOpenAiKey)}
                        >
                          {showOpenAiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <Button variant="outline" onClick={handleSaveOpenAiKey}>Save</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="google-maps-key">Google Maps API Key</Label>
                    <div className="flex space-x-2">
                      <div className="flex-1 relative">
                        <Input
                          id="google-maps-key"
                          type={showGoogleMapsKey ? "text" : "password"}
                          placeholder="Enter your Google Maps API key"
                          value={googleMapsKey}
                          onChange={(e) => setGoogleMapsKey(e.target.value)}
                          className="pr-20"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          className="absolute right-0 top-0 h-full px-3 text-xs"
                          onClick={() => setShowGoogleMapsKey(!showGoogleMapsKey)}
                        >
                          {showGoogleMapsKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <Button variant="outline" onClick={handleSaveGoogleMapsKey}>Save</Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-2">API Usage</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">GROQ API Usage</span>
                      <span className="text-sm font-medium">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">OpenAI API Usage</span>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                    <Progress value={25} className="h-2" />
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
                <Switch 
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                  className="hover-scale" 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Push Notifications</h3>
                  <p className="text-sm text-muted-foreground">Receive notifications in your browser</p>
                </div>
                <Switch 
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                  className="hover-scale" 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Task Reminders</h3>
                  <p className="text-sm text-muted-foreground">Get reminded about upcoming tasks</p>
                </div>
                <Switch 
                  checked={taskReminders}
                  onCheckedChange={setTaskReminders}
                  className="hover-scale" 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">New Comment Notifications</h3>
                  <p className="text-sm text-muted-foreground">Get notified when someone comments on your posts</p>
                </div>
                <Switch 
                  checked={commentNotifications}
                  onCheckedChange={setCommentNotifications}
                  className="hover-scale" 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">System Updates</h3>
                  <p className="text-sm text-muted-foreground">Get notified about system updates and new features</p>
                </div>
                <Switch 
                  checked={systemUpdates}
                  onCheckedChange={setSystemUpdates}
                  className="hover-scale" 
                />
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="hover-scale"
                onClick={handleResetNotifications}
              >
                Reset to Defaults
              </Button>
              <Button 
                className="hover-scale"
                onClick={handleSaveNotifications}
              >
                Save Changes
              </Button>
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
                <Switch 
                  checked={twoFactorAuth}
                  onCheckedChange={setTwoFactorAuth}
                  className="hover-scale" 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Session Timeout</h3>
                  <p className="text-sm text-muted-foreground">Automatically logout after period of inactivity</p>
                </div>
                <Select 
                  value={sessionTimeout}
                  onValueChange={setSessionTimeout}
                >
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
                <Button 
                  variant="outline" 
                  className="hover-scale"
                  onClick={() => {
                    toast({
                      title: "Login History",
                      description: "Your login history will be displayed here in the future.",
                    });
                  }}
                >
                  View History
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Password Requirements</h3>
                  <p className="text-sm text-muted-foreground">Set minimum requirements for passwords</p>
                </div>
                <Button 
                  variant="outline" 
                  className="hover-scale"
                  onClick={() => {
                    toast({
                      title: "Password Requirements",
                      description: "Password requirement settings will be available in the future.",
                    });
                  }}
                >
                  Configure
                </Button>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-4">
              <Button 
                variant="destructive" 
                className="hover-scale"
                onClick={() => {
                  toast({
                    title: "All Sessions Revoked",
                    description: "You've been logged out from all devices.",
                  });
                }}
              >
                Revoke All Sessions
              </Button>
              <Button 
                className="hover-scale"
                onClick={handleSaveSecurity}
              >
                Save Changes
              </Button>
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
              <Button 
                variant="outline" 
                className="hover-scale" 
                onClick={() => {
                  setLanguage('english');
                  setTimezone('utc');
                  setFontScale('1');
                  setColorScheme('default');
                  setDateFormat('mdy');
                  document.documentElement.style.fontSize = '100%';
                }}
              >
                Reset to Defaults
              </Button>
              <Button 
                className="hover-scale"
                onClick={handleSavePreferences}
              >
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
                <Switch 
                  checked={compactSidebar}
                  onCheckedChange={setCompactSidebar}
                  className="hover-scale" 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Fixed Header</h3>
                  <p className="text-sm text-muted-foreground">Keep the header fixed when scrolling</p>
                </div>
                <Switch 
                  checked={fixedHeader}
                  onCheckedChange={setFixedHeader}
                  className="hover-scale" 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Show Quick Actions</h3>
                  <p className="text-sm text-muted-foreground">Display quick action buttons in the header</p>
                </div>
                <Switch 
                  checked={showQuickActions}
                  onCheckedChange={setShowQuickActions}
                  className="hover-scale" 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Tabbed Interface</h3>
                  <p className="text-sm text-muted-foreground">Use tabs for navigation between sections</p>
                </div>
                <Switch 
                  checked={tabbedInterface}
                  onCheckedChange={setTabbedInterface}
                  className="hover-scale" 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Dashboard Layout</h3>
                  <p className="text-sm text-muted-foreground">Choose your preferred dashboard layout</p>
                </div>
                <Select
                  value={dashboardLayout}
                  onValueChange={setDashboardLayout}
                >
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
              <Button 
                variant="outline" 
                className="hover-scale"
                onClick={handleResetLayout}
              >
                Reset to Defaults
              </Button>
              <Button 
                className="hover-scale"
                onClick={handleSaveLayout}
              >
                Save Changes
              </Button>
            </div>
            
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Import/Export Settings</h3>
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={handleExportSettings}
                >
                  <Download className="h-4 w-4" />
                  Export Settings
                </Button>
                
                <div className="relative">
                  <Input
                    type="file"
                    id="import-settings"
                    className="hidden"
                    accept=".json"
                    onChange={handleImportSettings}
                  />
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => document.getElementById('import-settings')?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    Import Settings
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
