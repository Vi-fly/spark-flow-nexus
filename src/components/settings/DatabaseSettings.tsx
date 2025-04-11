
import React, { useState, useEffect } from 'react';
import { databaseConnector } from '@/utils/databaseConnector';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Database, Server, Waves, Download, Upload, RefreshCw } from 'lucide-react';

export function DatabaseSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('supabase');
  
  // NeonDB settings
  const [neonConnectionString, setNeonConnectionString] = useState<string>('');
  
  // Supabase settings
  const [supabaseUrl, setSupabaseUrl] = useState<string>('');
  const [supabaseKey, setSupabaseKey] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Load saved connection settings
  useEffect(() => {
    databaseConnector.loadConnectionConfig();
    const config = databaseConnector.getConnectionConfig();
    const currentDb = databaseConnector.getCurrentConnection();
    
    if (currentDb) {
      setActiveTab(currentDb);
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

  const handleImportData = () => {
    setIsImporting(true);
    
    // Simulate import process
    setTimeout(() => {
      setIsImporting(false);
      toast({
        title: "Data Import Complete",
        description: "Your data has been successfully imported."
      });
    }, 2000);
  };

  const handleExportData = () => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      toast({
        title: "Data Export Complete",
        description: "Your data has been successfully exported."
      });
    }, 2000);
  };

  const handleDatabaseSync = () => {
    toast({
      title: "Database Synchronization",
      description: "Synchronization process started. This may take a few minutes."
    });
    
    // Simulate sync process
    setTimeout(() => {
      toast({
        title: "Synchronization Complete",
        description: "Database has been successfully synchronized."
      });
    }, 3000);
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
        <TabsList className="grid grid-cols-2 mb-6">
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
      
      <div className="mt-8 border-t pt-6">
        <h3 className="text-xl font-semibold mb-4">Database Operations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <Button 
                variant="outline" 
                className="w-12 h-12 rounded-full mb-3"
                onClick={handleImportData}
                disabled={isImporting}
              >
                {isImporting ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
              </Button>
              <h4 className="font-medium">Import Data</h4>
              <p className="text-sm text-muted-foreground mt-1">Import data from file</p>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <Button 
                variant="outline" 
                className="w-12 h-12 rounded-full mb-3"
                onClick={handleExportData}
                disabled={isExporting}
              >
                {isExporting ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
              </Button>
              <h4 className="font-medium">Export Data</h4>
              <p className="text-sm text-muted-foreground mt-1">Export data to file</p>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <Button 
                variant="outline" 
                className="w-12 h-12 rounded-full mb-3"
                onClick={handleDatabaseSync}
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
              <h4 className="font-medium">Sync Database</h4>
              <p className="text-sm text-muted-foreground mt-1">Synchronize with remote</p>
            </div>
          </Card>
        </div>
      </div>
      
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
