
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ActionType = 'createTask' | 'createContact' | 'query' | 'unknown';

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
 * Execute a database action based on the parsed payload
 */
export const executeAction = async (action: ActionPayload): Promise<string> => {
  try {
    switch (action.type) {
      case 'createTask': {
        const { title, description, status = 'todo', priority = 'medium' } = action.data;
        
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
