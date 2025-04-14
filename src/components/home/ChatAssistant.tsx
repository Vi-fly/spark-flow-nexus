
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2, Database, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { databaseConnector } from '@/utils/databaseConnector';
import ReactMarkdown from 'react-markdown';
import { getChatResponse } from '@/services/chatService';
import { parseAction, executeAction } from '@/utils/chatActionProcessor';
import { supabase } from '@/integrations/supabase/client';

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
      content: "## Welcome to Task Manager AI\n\nI'm your AI assistant. I can help you manage tasks and contacts using natural language. Try asking me to create tasks, search data, or answer questions about your project.",
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
    checkSupabaseConnection();
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

  const checkSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from('tasks').select('count');
      if (!error) {
        toast({
          title: "Supabase Connected",
          description: "Connected to Supabase database",
        });
      }
    } catch (error) {
      console.error('Supabase connection error:', error);
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
      // Format the messages for the API
      const apiMessages = messages
        .concat(userMessage)
        .filter(msg => msg.sender === 'user' || msg.id === '1') // Include only user messages and the initial system message
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));
      
      // Get response from Groq API via our edge function
      const responseText = await getChatResponse(apiMessages);
      
      // Check if the response contains an action to execute
      const action = parseAction(responseText);
      let actionResult = '';
      
      if (action) {
        actionResult = await executeAction(action);
      }
      
      // Add AI response
      const aiMessage: Message = {
        id: generateId(),
        content: responseText + (actionResult ? `\n\n*Action Result: ${actionResult}*` : ''),
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: Message = {
        id: generateId(),
        content: "## Error\nI'm sorry, I encountered an error. Please try again later.",
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
                  "chat-message max-w-[85%] px-4 py-2 rounded-lg",
                  message.sender === 'user' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                )}
              >
                {message.sender === 'user' ? (
                  <p>{message.content}</p>
                ) : (
                  <ReactMarkdown 
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-2 mb-1" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-2 mb-1" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-md font-bold mt-2 mb-1" {...props} />,
                      p: ({node, ...props}) => <p className="mb-2" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                      li: ({node, ...props}) => <li className="mb-1" {...props} />,
                      a: ({node, ...props}) => <a className="text-blue-500 hover:underline" {...props} />,
                      code: ({node, ...props}) => {
                        const isInline = !props.className;
                        return isInline ? (
                          <code className="bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded" {...props} />
                        ) : (
                          <code className="block bg-gray-200 dark:bg-gray-800 p-2 rounded mb-2 overflow-x-auto" {...props} />
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                )}
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
