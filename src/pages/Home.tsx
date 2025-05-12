import ChatInput from '@/components/chat/ChatInput';
import ChatMessage from '@/components/chat/ChatMessage';
import FormDialog from '@/components/chat/FormDialog';
import TypingIndicator from '@/components/chat/TypingIndicator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { databaseService } from '@/services/databaseService';
import { DatabaseTable } from '@/types/database.types';

import { groqService, Message } from '@/services/groqService';
import { ClipboardList, Database } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const Home : React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tables, setTables] = useState<DatabaseTable[]>([]);
  const [taskCount, setTaskCount] = useState<number>(0);
  const [contactCount, setContactCount] = useState<number>(0);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [formType, setFormType] = useState<'task' | 'contact'>('task');
  const [formInitialData, setFormInitialData] = useState<any>(null);
  const [pendingAction, setPendingAction] = useState<any>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Initial setup and fetching available tables
  useEffect(() => {
    const initialize = async () => {
      try {
        // Fetch tables for context
        const fetchedTables = await databaseService.getTables();
        setTables(fetchedTables);

        // Get task and contact counts
        const tasks = await databaseService.getTableData('tasks');
        const contacts = await databaseService.getTableData('contacts');
        setTaskCount(tasks.length);
        setContactCount(contacts.length);

        // Add initial bot message
        const initialMessage: Message = {
          role: 'assistant',
          content: `👋 Hello! I'm your TaskBot assistant. I can help you manage your tasks and contacts. Currently, you have ${tasks.length} tasks and ${contacts.length} contacts in your database.\n\nWhat would you like to do? You can ask me to:\n- List all tasks or contacts\n- Add a new task or contact\n- Update a task status\n- Delete a task or contact\n- Find tasks by priority, status, or deadline`
        };
        setMessages([initialMessage]);
      } catch (error) {
        console.error('Initialization error:', error);
        toast({
          title: "Error Initializing",
          description: "Failed to connect to the database. Please try again.",
          variant: "destructive",
        });
      }
    };

    initialize();
  }, [toast]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check if all required fields for a task or contact are provided
  const hasRequiredFields = (data: any, type: 'task' | 'contact'): boolean => {
    if (type === 'task') {
      return !!data.title;
    } else {
      return !!data.name;
    }
  };
  
  // Check if we need additional details
  const needsAdditionalDetails = (action: any): boolean => {

    if (!action || !action.operation) return false;
    if (action.operation === 'insert') {
    

    
    if (action.table === 'tasks') {
      const requiredFields = [
        'title', 'description', 'category', 'priority', 
        'expected_outcome', 'deadline', 'estimated_time',
        'instructions', 'review_process', 'status'
      ];
      return !requiredFields.every(field => action.data?.[field]);
    }
    
    if (action.table === 'contacts') {
      const requiredFields = ['name', 'email', 'phone'];
      return !requiredFields.every(field => action.data?.[field]);
    }}
    
    return false;
  };

  // Handle form submission with additional details
  const handleFormSubmit = async (formData: any) => {
    if (!pendingAction) return;
    
    // Merge the form data with the pending action data
    const updatedAction = {
      ...pendingAction,
      data: {
        ...pendingAction.data,
        ...formData,
      }
    };
    
    try {
      // Execute the action with the complete data
      const result = await databaseService.executeAction(updatedAction);
      
      // Update counts after action
      if (updatedAction.operation !== 'select') {
        const tasks = await databaseService.getTableData('tasks');
        const contacts = await databaseService.getTableData('contacts');
        setTaskCount(tasks.length);
        setContactCount(contacts.length);
      }
      
      // Add success message to chat
      const successMessage = updatedAction.table === 'tasks' 
        ? `✅ Successfully created task "${formData.title}"`
        : `✅ Successfully created contact "${formData.name}"`;
        
      const botMessage: Message = { 
        role: 'assistant', 
        content: successMessage + " with all the details you provided."
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);
      
      // Show success toast
      toast({
        title: updatedAction.table === 'tasks' ? "Task Created" : "Contact Created",
        description: updatedAction.table === 'tasks' 
          ? `Added new task: ${formData.title}` 
          : `Added new contact: ${formData.name}`,
      });
    } catch (error: any) {
      console.error('Error executing action:', error);
      
      // Add error message
      const botMessage: Message = { 
        role: 'assistant', 
        content: `Sorry, I encountered an error: ${error.message}` 
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);
      
      // Show error toast
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      // Clear the pending action
      setPendingAction(null);
    }
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = { role: 'user', content };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);
  
    try {
      const context = { tables };
      const history = messages.slice(-6);
      
      const botResponse = await groqService.processMessage(content, context, history);
      const action = groqService.parseActionFromResponse(botResponse);
      
      if (action) {
        if (formDialogOpen) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: "Please complete the current form first."
          }]);
          setIsLoading(false);
          return;
        }
  
        // Handle insert operations with enhanced data validation
        if (action.operation === 'insert') {
          // Resolve contact assignments for tasks
          if (action.table === 'tasks' && action.data?.assigned_to) {
            const contactName = action.data.assigned_to;
            const contact = await databaseService.findContactByName(contactName);
            
            if (!contact) {
              setMessages(prev => [...prev, {
                role: 'assistant',
                content: `⚠️ Contact "${contactName}" not found. Please create them first.`
              }]);
              setIsLoading(false);
              return;
            }
            
            action.data.assigned_to = contact.id;
          }
  
          // Process temporal references
          if (action.data?.deadline) {
            const deadlineText = action.data.deadline.toLowerCase();
            const now = new Date();
            
            if (deadlineText === 'tomorrow') {
              action.data.deadline = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() + 1,
                23, 59, 59  // End of day
              ).toISOString();
            } else if (deadlineText === 'next week') {
              const nextWeek = new Date(now);
              nextWeek.setDate(now.getDate() + (7 - now.getDay() + 1) % 7);
              action.data.deadline = nextWeek.toISOString();
            }
          }
  
          // Set default required fields
          const baseData: { title?: string; status: string; created_at: string; updated_at: string } = {
            ...action.data,
            status: 'Not Started',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
  
          // Generate AI suggestions for tasks
          if (action.table === 'tasks' && baseData.title) {
            try {
              const aiSuggestions = await groqService.generateTaskDetails(baseData.title);
              Object.assign(baseData, aiSuggestions);
            } catch (error) {
              console.error("AI suggestions failed:", error);
            }
          }
  
          // Open form with prepared data
          setPendingAction({ ...action, data: baseData });
          setFormType(action.table === 'tasks' ? 'task' : 'contact');
          setFormInitialData(baseData);
          setFormDialogOpen(true);
          
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `Let's create the ${action.table.slice(0, -1)}. Please review the details.`
          }]);
          setIsLoading(false);
          return;
        }
          
        
        try {
          // Execute database action
          const result = await databaseService.executeAction(action);
          
          // Update counts after action
          if (action.operation !== 'select') {
            const tasks = await databaseService.getTableData('tasks');
            const contacts = await databaseService.getTableData('contacts');
            setTaskCount(tasks.length);
            setContactCount(contacts.length);
          }
          
          // Format result for display
          let resultMessage = "";
          if (action.operation === 'select') {
            const items = Array.isArray(result) ? result : [result];
            if (items.length > 0) {
              resultMessage = `\n\n\`\`\`\n${JSON.stringify(items)}\n\`\`\``;
            } else {
              resultMessage = "\n\nNo results found.";
            }
          }
          
          // Add the result to the bot's response
          const cleanedResponse = botResponse.replace(/```json[\s\S]*?```/g, '');
          const fullResponse = `${cleanedResponse}${resultMessage}\n\n${getActionSuccessMessage(action)}`;
          
          const botMessage: Message = { role: 'assistant', content: fullResponse };
          setMessages(prevMessages => [...prevMessages, botMessage]);
          
          // Show success toast
          toast({
            title: getActionTitle(action),
            description: getActionDescription(action),
          });
        } catch (dbError: any) {
          // Add error message
          const cleanedResponse = botResponse.replace(/```json[\s\S]*?```/g, '');
          const errorResponse = `${cleanedResponse}\n\nFailed to execute action: ${dbError.message}`;
          const botMessage: Message = { role: 'assistant', content: errorResponse };
          setMessages(prevMessages => [...prevMessages, botMessage]);
          
          // Show error toast
          toast({
            title: "Database Action Failed",
            description: dbError.message,
            variant: "destructive",
          });
        }
      } else {
        // Just a normal response without database action
        const botMessage: Message = { role: 'assistant', content: botResponse };
        setMessages(prevMessages => [...prevMessages, botMessage]);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Add error message from bot
      const botMessage: Message = {
        role: 'assistant',
        content: "Sorry, I encountered an error processing your request. Please try again."
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);
      
      toast({
        title: "Error",
        description: "Failed to process your message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions for action feedback
  const getActionTitle = (action: any): string => {
    switch (action.operation) {
      case 'select': return "Data Retrieved";
      case 'insert': return `New ${action.table === 'tasks' ? 'Task' : 'Contact'} Added`;
      case 'update': return `${action.table === 'tasks' ? 'Task' : 'Contact'} Updated`;
      case 'delete': return `${action.table === 'tasks' ? 'Task' : 'Contact'} Deleted`;
      default: return "Action Completed";
    }
  };
  
  const getActionDescription = (action: any): string => {
    switch (action.operation) {
      case 'select': return `Found data from ${action.table}`;
      case 'insert': return action.table === 'tasks' 
        ? `Added new task: ${action.data?.title || 'Unknown'}` 
        : `Added new contact: ${action.data?.name || 'Unknown'}`;
      case 'update': return `Successfully updated ${action.table} with ID: ${action.where?.id}`;
      case 'delete': return `Successfully deleted ${action.table} with ID: ${action.where?.id}`;
      default: return "Action completed successfully";
    }
  };
  
  const getActionSuccessMessage = (action: any): string => {
    switch (action.operation) {
      case 'select': return "I've retrieved the data you requested.";
      case 'insert': return action.table === 'tasks' 
        ? `✅ I've added the new task "${action.data?.title}" successfully.` 
        : `✅ I've added the new contact "${action.data?.name}" successfully.`;
      case 'update': return `✅ The ${action.table === 'tasks' ? 'task' : 'contact'} has been updated successfully.`;
      case 'delete': return `✅ The ${action.table === 'tasks' ? 'task' : 'contact'} has been deleted successfully.`;
      default: return "Operation completed successfully.";
    }
  };

  return (
    <div className="flex flex-col w-full h-screen max-h-screen">
      <Card className="flex-1 flex flex-col overflow-hidden border-0 rounded-none">
        <CardHeader className="border-b py-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Database size={20} className="text-primary" />
                <span>TaskBot</span>
              </CardTitle>
              <CardDescription>
                Manage your tasks and contacts with natural language
              </CardDescription>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-1 text-sm bg-primary/10 px-3 py-1 rounded-full">
                <ClipboardList size={16} />
                <span>{taskCount} Tasks</span>
              </div>
              <div className="flex items-center gap-1 text-sm bg-secondary/20 px-3 py-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span>{contactCount} Contacts</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      <ChatInput 
        onSendMessage={handleSendMessage} 
        isLoading={isLoading} 
        placeholder="Ask about your tasks or contacts (e.g., 'Add a new task to call John tomorrow')" 
      />
      
      {/* Form dialog for collecting additional details */}
      <FormDialog 
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        type={formType}
        initialData={formInitialData}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default Home;