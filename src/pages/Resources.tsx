
import React, { useState } from 'react';
import { ResourceChat } from '@/components/home/ResourceChat';
import { ResourceChatHistory } from '@/components/resources/ResourceChatHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Resources page - Page containing the AI-powered resource assistant using Groq API
 * 
 * Features:
 * - Displays the ResourceChat component
 * - Provides context about the assistant's capabilities
 * - Includes chat history functionality
 */
const Resources = () => {
  const [activeTab, setActiveTab] = useState("assistant");
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Tabs defaultValue="assistant" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="assistant">Resource Assistant</TabsTrigger>
          <TabsTrigger value="history">Chat History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="assistant">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-3/4">
              <ResourceChat />
            </div>
            
            <div className="w-full md:w-1/4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>About the Assistant</CardTitle>
                  <CardDescription>
                    Powered by Groq AI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    The Resource Assistant uses advanced AI to help answer your questions about contacts and their skills.
                    Chat suggestions are automatically saved to your history.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Example Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                    <li>Who has web development skills?</li>
                    <li>List all contacts who work at Tech Corp</li>
                    <li>Show me everyone with design skills</li>
                    <li>Which contacts have JavaScript experience?</li>
                    <li>Show all contacts</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <ResourceChatHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Resources;
