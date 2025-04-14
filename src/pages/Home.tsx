
import React from 'react';
import { ChatAssistant } from '@/components/home/ChatAssistant';
import { ResourceChat } from '@/components/home/ResourceChat';

const Home = () => {
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Welcome to Task Manager</h1>
      <p className="text-muted-foreground mb-8">
        Use the AI assistant below to manage your tasks and contacts using natural language.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Task Assistant</h2>
          <ChatAssistant />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Resource Assistant</h2>
          <ResourceChat />
        </div>
      </div>
    </div>
  );
};

export default Home;
