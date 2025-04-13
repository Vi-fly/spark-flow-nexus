
import React from 'react';
import { ResourceChat } from '@/components/home/ResourceChat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Resources page - Page containing the AI-powered resource assistant using Groq API
 * 
 * Features:
 * - Displays the ResourceChat component
 * - Provides context about the assistant's capabilities
 */
const Resources = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
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
                The Resource Assistant uses advanced AI to help answer your questions about resource management, project planning, and best practices.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Example Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                <li>What are the best practices for task prioritization?</li>
                <li>How can I manage team resources effectively?</li>
                <li>What tools would you recommend for project management?</li>
                <li>Can you explain agile vs waterfall methodology?</li>
                <li>How to create an effective project timeline?</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Resources;
