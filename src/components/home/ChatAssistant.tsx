
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2, Database, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { databaseConnector } from '@/utils/databaseConnector';

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

const generateId = () => Math.random().toString(36).substr(2, 9);

const suggestions = [
  "Create a new task for website redesign",
  "Show me all high priority tasks",
  "What contacts have web development skills?",
  "Add meeting with design team tomorrow at 2pm"
];

export function ChatAssistant() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      content: "Hello! I'm your AI assistant. How can I help you with task management today?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    type: string | null;
  }>({
    connected: false,
    type: null
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
    checkDatabaseConnection();
  }, []);

  const checkDatabaseConnection = async () => {
    try {
      databaseConnector.loadConnectionConfig();
      const isConnected = await databaseConnector.testConnection();
      setDbStatus({
        connected: isConnected,
        type: databaseConnector.getCurrentConnection()
      });
      
      if (isConnected) {
        toast({
          title: "Database Connected",
          description: `Connected to ${databaseConnector.getCurrentConnection()} database`,
        });
      }
    } catch (error) {
      console.error('Database connection error:', error);
      setDbStatus({
        connected: false,
        type: databaseConnector.getCurrentConnection()
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: generateId(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      await mockAIResponse(input);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: Message = {
        id: generateId(),
        content: "I'm sorry, I encountered an error. Please try again later.",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "AI Error",
        description: "Failed to generate response.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const mockAIResponse = async (userInput: string): Promise<void> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lowerInput = userInput.toLowerCase();
    let responseText = "";
    
    if (lowerInput.includes('create') && lowerInput.includes('task')) {
      responseText = "I've created a new task based on your request. You can view and edit it in the Tasks section.";
    } else if (lowerInput.includes('show') && lowerInput.includes('high priority')) {
      responseText = "I found 3 high priority tasks. You can view them in the Tasks section with the priority filter set to 'High'.";
    } else if (lowerInput.includes('contact') && lowerInput.includes('skill')) {
      responseText = "I found 5 contacts with the requested skills. You can view them in the Contacts section.";
    } else if (lowerInput.includes('add') && lowerInput.includes('meeting')) {
      responseText = "I've added the meeting to your calendar. You can view it in the Calendar section.";
    } else if (lowerInput.includes('database') || lowerInput.includes('connect')) {
      responseText = dbStatus.connected 
        ? `You're currently connected to a ${dbStatus.type} database.` 
        : "You're not connected to any database. Please configure your database in the Settings page.";
    } else {
      responseText = "I understand you need assistance with that. How would you like me to proceed?";
    }
    
    // Add AI response
    const aiMessage: Message = {
      id: generateId(),
      content: responseText,
      sender: 'ai',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, aiMessage]);
  };

  const useSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <Card className="w-full h-[calc(100vh-8rem)] flex flex-col shadow-md border border-border/40">
      <CardHeader className="px-6 py-4 border-b">
        <CardTitle className="text-xl flex items-center space-x-2">
          <Bot className="h-6 w-6 text-indigo-600" />
          <span>AI Database Assistant</span>
          {dbStatus.connected && (
            <div className="ml-2 flex items-center gap-1 text-sm font-normal text-green-500">
              <Database className="h-4 w-4" />
              <span>{dbStatus.type}</span>
            </div>
          )}
        </CardTitle>
        <CardDescription>
          Ask me to create tasks, search data, or perform actions using natural language
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 flex-1 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={cn(
                "flex",
                message.sender === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div 
                className={cn(
                  "chat-message animate-fade-in max-w-[85%] px-4 py-2 rounded-lg",
                  message.sender === 'user' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                )}
              >
                <p>{message.content}</p>
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="chat-message bg-muted max-w-[85%] px-4 py-2 rounded-lg animate-pulse">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      <CardFooter className="p-4 border-t">
        <div className="w-full space-y-4">
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Button 
                key={index} 
                variant="outline" 
                size="sm" 
                onClick={() => useSuggestion(suggestion)}
                className="text-xs hover:bg-muted"
              >
                {suggestion}
              </Button>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={checkDatabaseConnection}
              className="text-xs ml-auto"
            >
              <RefreshCcw className="h-3 w-3 mr-1" />
              Check DB
            </Button>
          </div>
          
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || !input.trim()}
              className="hover:scale-105 transition-transform"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardFooter>
    </Card>
  );
}

