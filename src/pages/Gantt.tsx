
import React, { useState } from 'react';
import { GanttChart } from '@/components/gantt/GanttChart';
import { GanttDashboard } from '@/components/gantt/GanttDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileDown, FileUp, Settings } from 'lucide-react';

const Gantt = () => {
  const [activeTab, setActiveTab] = useState('chart');

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Timeline</h1>
          <p className="text-muted-foreground">Manage your project tasks and timeline efficiently</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FileUp className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      <Tabs defaultValue="chart" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="chart">Gantt Chart</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>
        <TabsContent value="chart" className="mt-4">
          <GanttChart />
        </TabsContent>
        <TabsContent value="dashboard" className="mt-4">
          <GanttDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Gantt;
