
/**
 * Task Service - Handles all task-related data operations with Supabase
 */
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define Task type based on database structure
export type Task = {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  deadline?: string | null;
  estimated_time?: string | null;
  assigned_to?: string | null;
  contact_id?: string | null;
  created_at: string;
  updated_at: string;
  category?: string | null;
  expected_outcome?: string | null;
  dependencies?: string | null;
  required_resources?: string | null;
  instructions?: string | null;
  review_process?: string | null;
  performance_metrics?: string | null;
  support_contact?: string | null;
  notes?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
};

// Define Task input type for creation/updates
export type TaskInput = Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

// Helper function to map database status values to our internal enum
const mapStatusValue = (status: string): 'todo' | 'in-progress' | 'done' => {
  const statusLower = status.toLowerCase();
  if (statusLower === 'not started' || statusLower === 'todo') return 'todo';
  if (statusLower === 'in progress' || statusLower === 'in-progress') return 'in-progress';
  if (statusLower === 'completed' || statusLower === 'done' || statusLower === 'reviewed & approved') return 'done';
  return 'todo'; // Default value
};

// Helper function to map database priority values to our internal enum
const mapPriorityValue = (priority: string): 'low' | 'medium' | 'high' => {
  const priorityLower = priority.toLowerCase();
  if (priorityLower === 'low') return 'low';
  if (priorityLower === 'medium') return 'medium';
  if (priorityLower === 'high') return 'high';
  return 'medium'; // Default value
};

/**
 * Fetch all tasks for the current user
 */
export const getAllTasks = async (): Promise<Task[]> => {
  try {
    // Get tasks from Supabase
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Handle errors
    if (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
      return [];
    }
    
    // Transform data to match our Task type
    const transformedData = data.map(task => ({
      ...task,
      status: mapStatusValue(task.status),
      priority: mapPriorityValue(task.priority)
    })) as Task[];
    
    return transformedData || [];
  } catch (error) {
    console.error('Unexpected error fetching tasks:', error);
    toast.error('Failed to load tasks');
    return [];
  }
};

/**
 * Fetch a single task by ID
 */
export const getTaskById = async (id: string): Promise<Task | null> => {
  try {
    // Get task from Supabase
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();
    
    // Handle errors
    if (error) {
      console.error('Error fetching task:', error);
      toast.error('Failed to load task');
      return null;
    }
    
    // Transform data to match our Task type
    const transformedData = {
      ...data,
      status: mapStatusValue(data.status),
      priority: mapPriorityValue(data.priority)
    } as Task;
    
    return transformedData;
  } catch (error) {
    console.error('Unexpected error fetching task:', error);
    toast.error('Failed to load task');
    return null;
  }
};

/**
 * Create a new task
 */
export const createTask = async (taskInput: TaskInput): Promise<Task | null> => {
  try {
    // Get the user's ID from the auth context
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('You must be logged in to create a task');
      return null;
    }
    
    // Prepare the task with the user_id
    const task = {
      ...taskInput,
      user_id: user.id
    };
    
    // Insert task into Supabase
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();
    
    // Handle errors
    if (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
      return null;
    }
    
    // Show success message
    toast.success('Task created successfully');
    
    // Return the created task with proper type mappings
    return {
      ...data,
      status: mapStatusValue(data.status),
      priority: mapPriorityValue(data.priority)
    } as Task;
  } catch (error) {
    console.error('Unexpected error creating task:', error);
    toast.error('Failed to create task');
    return null;
  }
};

/**
 * Update an existing task
 */
export const updateTask = async (id: string, taskInput: Partial<TaskInput>): Promise<Task | null> => {
  try {
    // Update task in Supabase
    const { data, error } = await supabase
      .from('tasks')
      .update(taskInput)
      .eq('id', id)
      .select()
      .single();
    
    // Handle errors
    if (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
      return null;
    }
    
    // Show success message
    toast.success('Task updated successfully');
    
    // Return the updated task with proper type mappings
    return {
      ...data,
      status: mapStatusValue(data.status),
      priority: mapPriorityValue(data.priority)
    } as Task;
  } catch (error) {
    console.error('Unexpected error updating task:', error);
    toast.error('Failed to update task');
    return null;
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (id: string): Promise<boolean> => {
  try {
    // Delete task from Supabase
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    // Handle errors
    if (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      return false;
    }
    
    // Show success message
    toast.success('Task deleted successfully');
    
    return true;
  } catch (error) {
    console.error('Unexpected error deleting task:', error);
    toast.error('Failed to delete task');
    return false;
  }
};
