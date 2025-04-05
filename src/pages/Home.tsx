
import React from 'react';
import { ChatAssistant } from '@/components/home/ChatAssistant';

const Home = () => {
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Welcome to Task Manager</h1>
      <p className="text-muted-foreground mb-8">
        Use the AI assistant below to manage your tasks and contacts using natural language.
      </p>
      <ChatAssistant />
    </div>
  );
};

export default Home;
