
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, Send, User, Edit, Trash2 } from 'lucide-react';
import { executeAction, parseAction } from '@/utils/chatActionProcessor';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Message types
type MessageRole = 'user' | 'assistant' | 'system';

interface Message {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: Date;
  actions?: {
    type: string;
    data: any;
  }[];
}

export function ChatAssistant() {
  // State for chat messages and input
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Reference for message container to enable auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Get toast for notifications
  const { toast } = useToast();
  
  // Initial welcome message
  useEffect(() => {
    setMessages([
      {
        id: '1',
        content: "Hi there! I'm your task management assistant. You can ask me to:\n\n- Create tasks\n- Create contacts\n- Delete tasks or contacts\n- Query your data\n\nJust let me know what you need!",
        role: 'assistant',
        timestamp: new Date(),
      },
    ]);
  }, []);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Focus input when editing is toggled
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);
  
  // Helper function to scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Process a message to find any actions
  const processMessage = (content: string): { processedContent: string; actions: any[] } => {
    // Parse actions from message content
    const action = parseAction(content);
    
    // Remove JSON blocks from displayed content
    let processedContent = content.replace(/```json\s*({[\s\S]*?})\s*```/g, '');
    
    // Clean up any double line breaks created by removing JSON blocks
    processedContent = processedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    return {
      processedContent: processedContent.trim(),
      actions: action ? [action] : [],
    };
  };
  
  // Execute actions from a message
  const handleExecuteAction = async (action: any) => {
    try {
      const result = await executeAction(action);
      
      // Add system message with action result
      const systemMessage: Message = {
        id: Date.now().toString(),
        content: `Action Result: ${result}`,
        role: 'system',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, systemMessage]);
      
      // Refresh the UI after successful action execution
      return result;
    } catch (error) {
      console.error('Error executing action:', error);
      toast({
        title: 'Error',
        description: `Failed to execute action: ${error.message}`,
        variant: 'destructive',
      });
      return `Error: ${error.message}`;
    }
  };
  
  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    // If editing an existing message
    if (isEditing && editingMessageId) {
      const updatedMessages = messages.map(msg => 
        msg.id === editingMessageId 
          ? { ...msg, content: inputMessage } 
          : msg
      );
      
      setMessages(updatedMessages);
      setInputMessage('');
      setIsEditing(false);
      setEditingMessageId(null);
      return;
    }
    
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      // Send message to AI
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      
      const responseData = await response.text();
      
      // Process the response to extract actions
      const { processedContent, actions } = processMessage(responseData);
      
      // Add AI response to chat
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: processedContent,
        role: 'assistant',
        timestamp: new Date(),
        actions: actions,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Auto-execute actions if present
      if (actions && actions.length > 0) {
        for (const action of actions) {
          await handleExecuteAction(action);
        }
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: 'Error',
        description: 'Failed to get response from the assistant. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Edit a message
  const handleEditMessage = (message: Message) => {
    // Only allow editing user messages
    if (message.role !== 'user') return;
    
    setInputMessage(message.content);
    setIsEditing(true);
    setEditingMessageId(message.id);
  };
  
  // Delete a message and its associated AI response
  const handleDeleteMessage = (messageId: string) => {
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    
    // If message not found or is not a user message, do nothing
    if (messageIndex === -1 || messages[messageIndex].role !== 'user') return;
    
    // Check if next message is an AI response to this message
    const nextMessageIndex = messageIndex + 1;
    const isNextMessageAIResponse = nextMessageIndex < messages.length && 
      messages[nextMessageIndex].role === 'assistant';
    
    // Also check if there's a system message following the AI response
    const afterNextMessageIndex = nextMessageIndex + 1;
    const isAfterNextMessageSystem = afterNextMessageIndex < messages.length && 
      messages[afterNextMessageIndex].role === 'system';
    
    // Determine how many messages to remove (user message + potentially AI response + potentially system message)
    let messagesToRemove = 1;
    if (isNextMessageAIResponse) messagesToRemove++;
    if (isNextMessageAIResponse && isAfterNextMessageSystem) messagesToRemove++;
    
    // Create new messages array without the deleted messages
    const newMessages = [
      ...messages.slice(0, messageIndex),
      ...messages.slice(messageIndex + messagesToRemove)
    ];
    
    setMessages(newMessages);
    
    // If currently editing this message, cancel editing
    if (editingMessageId === messageId) {
      setIsEditing(false);
      setEditingMessageId(null);
      setInputMessage('');
    }
  };
  
  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle>Task Assistant</CardTitle>
        <CardDescription>
          Ask me to help you manage tasks and contacts
        </CardDescription>
      </CardHeader>
      
      {/* Message container */}
      <CardContent className="flex-1 overflow-auto pb-0">
        <div className="space-y-4 h-full">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              } group`}
            >
              <div className={`flex items-start max-w-[80%] gap-2 ${
                message.role === 'system' ? 'w-full justify-center' : ''
              }`}>
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : message.role === 'system'
                      ? 'bg-muted/50 text-muted-foreground text-sm w-fit'
                      : 'bg-muted'
                  }`}
                >
                  {message.role === 'user' ? (
                    <div className="relative">
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      
                      {/* Action buttons for user messages */}
                      <div className="absolute right-0 top-0 -mt-2 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="h-6 w-6 rounded-full bg-background"
                          onClick={() => handleEditMessage(message)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="h-6 w-6 rounded-full bg-background hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => handleDeleteMessage(message.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className={`prose prose-sm ${message.role === 'system' ? 'prose-neutral' : 'dark:prose-invert'}`}>
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  )}
                  
                  {message.role !== 'system' && (
                    <div className="mt-1 text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  )}
                </div>
                
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-secondary">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-2 rounded-lg px-4 py-2 bg-muted">
                <div className="flex space-x-1 items-center">
                  <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
                </div>
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}
          
          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      {/* Message input form */}
      <CardFooter className="pt-4">
        <form onSubmit={handleSubmit} className="w-full flex gap-2">
          <Input
            ref={inputRef}
            placeholder={isEditing ? "Edit your message..." : "Type your message..."}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
            className={`flex-1 ${isEditing ? 'border-amber-500' : ''}`}
          />
          {isEditing && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsEditing(false);
                setEditingMessageId(null);
                setInputMessage('');
              }}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" size="icon" disabled={isLoading || !inputMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
