
import React, { useState, useEffect } from 'react';
import { databaseConnector } from '@/utils/databaseConnector';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Database, Server, Waves } from 'lucide-react';

export function DatabaseSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('supabase');
  
  // MongoDB settings
  const [mongoUri, setMongoUri] = useState<string>('');
  const [mongoDbName, setMongoDbName] = useState<string>('');
  
  // NeonDB settings
  const [neonConnectionString, setNeonConnectionString] = useState<string>('');
  
  // Supabase settings
  const [supabaseUrl, setSupabaseUrl] = useState<string>('');
  const [supabaseKey, setSupabaseKey] = useState<string>('');
  
  // Load saved connection settings
  useEffect(() => {
    databaseConnector.loadConnectionConfig();
    const config = databaseConnector.getConnectionConfig();
    const currentDb = databaseConnector.getCurrentConnection();
    
    if (currentDb) {
      setActiveTab(currentDb);
    }
    
    if (config.mongodb) {
      setMongoUri(config.mongodb.uri);
      setMongoDbName(config.mongodb.dbName);
    }
    
    if (config.neondb) {
      setNeonConnectionString(config.neondb.connectionString);
    }
    
    if (config.supabase) {
      setSupabaseUrl(config.supabase.url);
      setSupabaseKey(config.supabase.key);
    }
  }, []);

  const testConnection = async () => {
    if (await databaseConnector.testConnection()) {
      toast({
        title: "Connection Successful",
        description: `Successfully connected to ${databaseConnector.getCurrentConnection()} database.`,
      });
    } else {
      toast({
        title: "Connection Failed",
        description: "Could not connect to database. Please check your settings.",
        variant: "destructive"
      });
    }
  };

  const saveMongoDbConfig = () => {
    if (!mongoUri || !mongoDbName) {
      toast({
        title: "Validation Error",
        description: "All MongoDB fields are required",
        variant: "destructive"
      });
      return;
    }
    
    databaseConnector.configureMongoDb(mongoUri, mongoDbName);
    toast({
      title: "MongoDB Configuration Saved",
      description: "Your MongoDB connection settings have been saved."
    });
  };

  const saveNeonDbConfig = () => {
    if (!neonConnectionString) {
      toast({
        title: "Validation Error",
        description: "NeonDB connection string is required",
        variant: "destructive"
      });
      return;
    }
    
    databaseConnector.configureNeonDb(neonConnectionString);
    toast({
      title: "NeonDB Configuration Saved",
      description: "Your NeonDB connection settings have been saved."
    });
  };

  const saveSupabaseConfig = () => {
    if (!supabaseUrl || !supabaseKey) {
      toast({
        title: "Validation Error",
        description: "All Supabase fields are required",
        variant: "destructive"
      });
      return;
    }
    
    databaseConnector.configureSupabase(supabaseUrl, supabaseKey);
    toast({
      title: "Supabase Configuration Saved",
      description: "Your Supabase connection settings have been saved."
    });
  };

  return (
    <Card className="p-6 glass animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 gradient-text">Database Configuration</h2>
      
      <Tabs 
        defaultValue={activeTab} 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger 
            value="mongodb" 
            className="flex items-center gap-2 animate-slide-in hover-scale"
          >
            <Server className="h-4 w-4" />
            <span>MongoDB</span>
          </TabsTrigger>
          <TabsTrigger 
            value="neondb" 
            className="flex items-center gap-2 animate-slide-in hover-scale"
          >
            <Waves className="h-4 w-4" />
            <span>NeonDB</span>
          </TabsTrigger>
          <TabsTrigger 
            value="supabase" 
            className="flex items-center gap-2 animate-slide-in hover-scale"
          >
            <Database className="h-4 w-4" />
            <span>Supabase</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="mongodb" className="animate-fade-in">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mongoUri">MongoDB URI</Label>
              <Input 
                id="mongoUri"
                placeholder="mongodb://username:password@host:port/database" 
                value={mongoUri}
                onChange={(e) => setMongoUri(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mongoDbName">Database Name</Label>
              <Input 
                id="mongoDbName"
                placeholder="task_manager" 
                value={mongoDbName}
                onChange={(e) => setMongoDbName(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-4 mt-6">
              <Button onClick={saveMongoDbConfig} className="hover-scale">Save Settings</Button>
              <Button onClick={testConnection} variant="outline" className="hover-scale">Test Connection</Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="neondb" className="animate-fade-in">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="neonConnString">Connection String</Label>
              <Input 
                id="neonConnString"
                placeholder="postgres://username:password@host:port/database" 
                value={neonConnectionString}
                onChange={(e) => setNeonConnectionString(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-4 mt-6">
              <Button onClick={saveNeonDbConfig} className="hover-scale">Save Settings</Button>
              <Button onClick={testConnection} variant="outline" className="hover-scale">Test Connection</Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="supabase" className="animate-fade-in">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supabaseUrl">Supabase URL</Label>
              <Input 
                id="supabaseUrl"
                placeholder="https://example.supabase.co" 
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supabaseKey">Supabase Anon Key</Label>
              <Input 
                id="supabaseKey"
                type="password"
                placeholder="Your Supabase anon key" 
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-4 mt-6">
              <Button onClick={saveSupabaseConfig} className="hover-scale">Save Settings</Button>
              <Button onClick={testConnection} variant="outline" className="hover-scale">Test Connection</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 p-4 bg-muted rounded-lg border border-dashed animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Data Persistence</h3>
          <Switch id="localStoragePersistence" defaultChecked />
        </div>
        <p className="text-sm text-muted-foreground">
          When enabled, your connection settings will be saved in your browser's local storage.
        </p>
      </div>
    </Card>
  );
}
