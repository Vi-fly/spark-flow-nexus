
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ActionType = 'createTask' | 'createContact' | 'deleteTask' | 'deleteContact' | 'query' | 'unknown';

interface ActionPayload {
  type: ActionType;
  data: Record<string, any>;
}

/**
 * Try to parse the action from the AI's response
 */
export const parseAction = (content: string): ActionPayload | null => {
  // Look for JSON action blocks in the response
  const actionMatch = content.match(/```json\s*({[\s\S]*?})\s*```/);
  
  if (actionMatch && actionMatch[1]) {
    try {
      const actionData = JSON.parse(actionMatch[1]);
      if (actionData.type && actionData.data) {
        return actionData as ActionPayload;
      }
    } catch (error) {
      console.error('Error parsing action JSON:', error);
    }
  }
  
  // No valid action found
  return null;
};

/**
 * Validate task data
 */
const validateTaskData = (data: any): { valid: boolean; message?: string } => {
  if (!data.title || data.title.trim() === '') {
    return { valid: false, message: "Task title is required" };
  }
  
  if (!data.status || !['todo', 'in-progress', 'completed', 'Not Started', 'In Progress', 'On Hold', 'Completed', 'Reviewed & Approved'].includes(data.status)) {
    return { valid: false, message: "Invalid task status" };
  }
  
  if (!data.priority || !['low', 'medium', 'high', 'Low', 'Medium', 'High'].includes(data.priority)) {
    return { valid: false, message: "Invalid task priority" };
  }
  
  return { valid: true };
};

/**
 * Validate contact data
 */
const validateContactData = (data: any): { valid: boolean; message?: string } => {
  if (!data.name || data.name.trim() === '') {
    return { valid: false, message: "Contact name is required" };
  }
  
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { valid: false, message: "Invalid email format" };
  }
  
  if (data.phone && !/^\d{10,15}$/.test(String(data.phone))) {
    return { valid: false, message: "Phone number should be 10-15 digits" };
  }
  
  return { valid: true };
};

/**
 * Execute a database action based on the parsed payload
 */
export const executeAction = async (action: ActionPayload): Promise<string> => {
  try {
    switch (action.type) {
      case 'createTask': {
        const { title, description, status = 'todo', priority = 'medium' } = action.data;
        
        // Validate task data
        const validation = validateTaskData(action.data);
        if (!validation.valid) {
          toast.error(validation.message || "Invalid task data");
          return `Error: ${validation.message}`;
        }
        
        // Get the user's ID
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          return "You need to be logged in to create a task.";
        }
        
        // Insert the task
        const { data, error } = await supabase
          .from('tasks')
          .insert([
            { 
              title, 
              description, 
              status, 
              priority,
              user_id: user.id
            }
          ])
          .select()
          .single();
          
        if (error) throw error;
        
        toast.success("Task created successfully!");
        return `Task "${title}" created successfully!`;
      }
      
      case 'createContact': {
        const { name, email, phone, company, role } = action.data;
        
        // Validate contact data
        const validation = validateContactData(action.data);
        if (!validation.valid) {
          toast.error(validation.message || "Invalid contact data");
          return `Error: ${validation.message}`;
        }
        
        // Get the user's ID
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          return "You need to be logged in to create a contact.";
        }
        
        // Insert the contact
        const { data, error } = await supabase
          .from('contacts')
          .insert([
            { 
              name, 
              email, 
              phone, 
              company, 
              role,
              user_id: user.id
            }
          ])
          .select()
          .single();
          
        if (error) throw error;
        
        toast.success("Contact created successfully!");
        return `Contact "${name}" created successfully!`;
      }
      
      case 'deleteTask': {
        const { id } = action.data;
        
        if (!id) {
          return "Task ID is required for deletion.";
        }
        
        // Get the user's ID
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          return "You need to be logged in to delete a task.";
        }
        
        // Delete the task
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        toast.success("Task deleted successfully!");
        return `Task with ID ${id} deleted successfully!`;
      }
      
      case 'deleteContact': {
        const { id } = action.data;
        
        if (!id) {
          return "Contact ID is required for deletion.";
        }
        
        // Get the user's ID
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          return "You need to be logged in to delete a contact.";
        }
        
        // Delete the contact
        const { error } = await supabase
          .from('contacts')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        toast.success("Contact deleted successfully!");
        return `Contact with ID ${id} deleted successfully!`;
      }
      
      case 'query': {
        const { table, filters } = action.data;
        
        if (!table || !['tasks', 'contacts'].includes(table)) {
          return "Invalid table specified for query.";
        }
        
        // Start building the query
        let query = supabase.from(table).select('*');
        
        // Apply filters if any
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value) {
              query = query.eq(key, value);
            }
          });
        }
        
        // Execute the query
        const { data, error } = await query;
        
        if (error) throw error;
        
        return `Found ${data.length} results.`;
      }
      
      default:
        return "Unknown action type.";
    }
  } catch (error) {
    console.error('Error executing action:', error);
    toast.error("Failed to execute action.");
    return `Error: ${error.message}`;
  }
};
