import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, Send, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

/**
 * Message type definition
 */
type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

/**
 * ResourceChat component - AI-powered chat for resources using Groq API
 */
export function ResourceChat() {
  // State for chat messages and input
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{user: string, bot: string}>>([]);
  
  // Reference for message container to enable auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get toast for notifications
  const { toast } = useToast();
  
  // Add initial welcome message when component mounts
  useEffect(() => {
    setMessages([
      {
        id: '1',
        content: "Hello! I'm your Resource Assistant. I can help you find information about contacts and their skills. Ask me questions like 'Who has web development skills?' or 'List all contacts who work at XYZ company'.",
        role: 'assistant',
        timestamp: new Date(),
      },
    ]);
  }, []);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  /**
   * Scroll to the bottom of the message container
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  /**
   * Get resource information from Supabase
   */
  const getResourceInfo = async (query: string): Promise<string> => {
    try {
      // Fetch contacts from Supabase - only get name and skills
      const { data: contacts, error } = await supabase
        .from('contacts')
        .select('name, skills, company');
      
      if (error) throw error;
      
      // Check if there are any contacts
      if (!contacts || contacts.length === 0) {
        return "I couldn't find any contacts in the database. Please add some contacts first.";
      }
      
      // Process the query
      const lowerQuery = query.toLowerCase();
      
      // Search for skills
      if (lowerQuery.includes('skill') || lowerQuery.includes('know') || lowerQuery.includes('expertise')) {
        // Extract skill to search for
        const skillMatches = /\b(javascript|react|design|writing|management|sales|marketing|development|web|mobile|database|backend|frontend)\b/gi.exec(query);
        const skillToSearch = skillMatches ? skillMatches[0].toLowerCase() : null;
        
        if (skillToSearch) {
          // Find contacts with that skill
          const matchedContacts = contacts.filter(contact => {
            if (!contact.skills) return false;
            
            // Handle string case
            if (typeof contact.skills === 'string') {
              return contact.skills.toLowerCase().includes(skillToSearch);
            }
            
            // Handle array case
            if (Array.isArray(contact.skills)) {
              // Fixed: Added proper type checking and safety for each skill element
              return contact.skills.some(skill => {
                // Make sure skill is a string before calling toLowerCase
                if (typeof skill === 'string') {
                  return skill.toLowerCase().includes(skillToSearch);
                }
                return false;
              });
            }
            
            return false;
          });
          
          if (matchedContacts.length > 0) {
            return `## Contacts with ${skillToSearch} skills\n\n${matchedContacts.map(c => `- ${c.name}`).join('\n')}`;
          } else {
            return `I couldn't find any contacts with ${skillToSearch} skills.`;
          }
        }
      }
      
      // Search for company
      if (lowerQuery.includes('company') || lowerQuery.includes('work') || lowerQuery.includes('organization')) {
        const companyMatches = /\b(at|from|in|for)\s+([a-zA-Z]+)\b/i.exec(query);
        const companyToSearch = companyMatches ? companyMatches[2].toLowerCase() : null;
        
        if (companyToSearch) {
          // Fixed: Added proper type checking before calling toLowerCase
          const matchedContacts = contacts.filter(contact => 
            contact.company && typeof contact.company === 'string' && 
            contact.company.toLowerCase().includes(companyToSearch)
          );
          
          if (matchedContacts.length > 0) {
            return `## Contacts at ${companyToSearch}\n\n${matchedContacts.map(c => `- ${c.name}`).join('\n')}`;
          } else {
            return `I couldn't find any contacts working at ${companyToSearch}.`;
          }
        }
      }
      
      // General list of contacts
      if (lowerQuery.includes('list') || lowerQuery.includes('all contacts') || lowerQuery.includes('show contacts')) {
        return `## All Contacts\n\n${contacts.map(c => `- ${c.name}${c.company ? ` (${c.company})` : ''}`).join('\n')}`;
      }
      
      // Default response if no specific query matched
      return "I can help you find contacts by their skills or company. Try asking something like 'Who has JavaScript skills?' or 'List all contacts who work at Tech Corp'.";
      
    } catch (error) {
      console.error("Error fetching resource info:", error);
      return "I'm sorry, I encountered an error while trying to fetch the resource information. Please try again later.";
    }
  };
  
  /**
   * Save a chat to history
   */
  const saveToChatHistory = (userMessage: string, botResponse: string) => {
    const updatedHistory = [...chatHistory, { user: userMessage, bot: botResponse }];
    // Keep only the last 10 conversations
    if (updatedHistory.length > 10) {
      updatedHistory.shift();
    }
    setChatHistory(updatedHistory);
    
    // Save to local storage
    localStorage.setItem('resourceChatHistory', JSON.stringify(updatedHistory));
    
    toast({
      title: 'Suggestion saved',
      description: 'Your conversation has been saved to history',
    });
  };
  
  /**
   * Handle message submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
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
      // Get response based on contacts database
      const response = await getResourceInfo(inputMessage);
      
      // Add AI response to chat
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Auto-save to chat history
      saveToChatHistory(inputMessage, response);
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: 'Error',
        description: 'Failed to get information from the database. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="h-[80vh] flex flex-col">
      <CardHeader>
        <CardTitle>Resource Assistant</CardTitle>
        <CardDescription>
          Ask questions about contacts and their skills to find the right people for your project.
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
              }`}
            >
              <div className="flex items-start max-w-[80%] gap-2">
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
                      : 'bg-muted'
                  }`}
                >
                  {message.role === 'user' ? (
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert">
                      <ReactMarkdown
                        components={{
                          h1: ({node, ...props}) => <h1 style={{fontSize: "1.5rem", fontWeight: "bold", marginTop: "0.5rem", marginBottom: "0.25rem"}} {...props} />,
                          h2: ({node, ...props}) => <h2 style={{fontSize: "1.25rem", fontWeight: "bold", marginTop: "0.5rem", marginBottom: "0.25rem"}} {...props} />,
                          h3: ({node, ...props}) => <h3 style={{fontSize: "1.125rem", fontWeight: "bold", marginTop: "0.5rem", marginBottom: "0.25rem"}} {...props} />,
                          p: ({node, ...props}) => <p style={{marginBottom: "0.5rem"}} {...props} />,
                          ul: ({node, ...props}) => <ul style={{listStyleType: "disc", paddingLeft: "1.25rem", marginBottom: "0.5rem"}} {...props} />,
                          ol: ({node, ...props}) => <ol style={{listStyleType: "decimal", paddingLeft: "1.25rem", marginBottom: "0.5rem"}} {...props} />,
                          li: ({node, ...props}) => <li style={{marginBottom: "0.25rem"}} {...props} />,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                  <div className="mt-1 text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
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
            placeholder="Ask about contacts or skills..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !inputMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
