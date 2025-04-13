
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
};

// Define Task input type for creation/updates
export type TaskInput = Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

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
    
    // Return the tasks
    return data || [];
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
    
    // Return the task
    return data;
  } catch (error) {
    console.error('Unexpected error fetching task:', error);
    toast.error('Failed to load task');
    return null;
  }
};

/**
 * Create a new task
 */
export const createTask = async (task: TaskInput): Promise<Task | null> => {
  try {
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
    
    // Return the created task
    return data;
  } catch (error) {
    console.error('Unexpected error creating task:', error);
    toast.error('Failed to create task');
    return null;
  }
};

/**
 * Update an existing task
 */
export const updateTask = async (id: string, task: Partial<TaskInput>): Promise<Task | null> => {
  try {
    // Update task in Supabase
    const { data, error } = await supabase
      .from('tasks')
      .update(task)
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
    
    // Return the updated task
    return data;
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
