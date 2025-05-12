
/**
 * Task Service - Handles all task-related data operations with Supabase
 */
import { supabase } from "@/integrations/supabase/client";
import { Task } from '@/types/database.types';
import { toast } from "sonner";

// Define Task type based on database structure


// Define Task input type for creation/updates
export type TaskInput = {
  title: string;
  description: string;
  category: string;
  status: 'Not Started' | 'In Progress' | 'On Hold' | 'Completed' | 'Reviewed & Approved';
  priority: 'Low' | 'Medium' | 'High';
  expected_outcome: string;
  deadline: string;  // ISO string
  estimated_time: string;
  assigned_to: number;  // Required BIGINT
  dependencies: string | null;  
  required_resources: string | null;  
  instructions: string | null;
  review_process: string | null;
  performance_metrics: string | null;  
  support_contact?: number | null;
  notes?: string | null;
  // Include these if needed
  started_at?: Date | null;
  completed_at?: Date | null;
};






// Helper function to map database status values to our internal enum
type DatabaseStatus = 'Not Started' | 'In Progress' | 'On Hold' | 'Completed' | 'Reviewed & Approved';
// type UIStatus = 'todo' | 'in-progress' | 'on-hold' | 'completed' | 'reviewed-approved';

// // UI → Database conversion
// const mapStatusValue = (status: string): DatabaseStatus => {
//   const reverseMap: Record<UIStatus, DatabaseStatus> = {
//     'todo': 'Not Started',
//     'in-progress': 'In Progress',
//     'on-hold': 'On Hold',
//     'completed': 'Completed',
//     'reviewed-approved': 'Reviewed & Approved'
//   };
  
//   return reverseMap[status] || 'Not Started';
// };


// Helper function to map database priority values to our internal enum
// const mapPriorityValue = (priority: string): 'Low' | 'Medium' | 'High' => {
//   const priorityLower = priority.toLowerCase();
//   if (priorityLower === 'Low') return 'Low';
//   if (priorityLower === 'Medium') return 'Medium';
//   if (priorityLower === 'High') return 'High';
//   return 'Medium'; // Default value
// };

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
      status: (task.status),
      priority: (task.priority)
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
export const getTaskById = async (id: number): Promise<Task | null> => {
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
      status: (data.status),
      priority: (data.priority)
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
    // Remove user check since we're using assigned_to for ownership
    const processedTask = {
      title: taskInput.title,
      description: taskInput.description || '',
      category: taskInput.category,
      status: taskInput.status,
      priority: taskInput.priority,
      expected_outcome: taskInput.expected_outcome,
      deadline: new Date(taskInput.deadline).toISOString(),
      estimated_time: taskInput.estimated_time,
      assigned_to: taskInput.assigned_to,
      dependencies: taskInput.dependencies,
      required_resources: taskInput.required_resources,
      instructions: taskInput.instructions,
      review_process: taskInput.review_process,
      performance_metrics: taskInput.performance_metrics,
      support_contact: taskInput.support_contact || null,
      notes: taskInput.notes || null
    };
    

    if (!processedTask.description) throw new Error('Description is required');
    if (!processedTask.category) throw new Error('Category is required');
    if (!processedTask.instructions) throw new Error('Instructions are required');
    // Insert task into Supabase
    const { data, error } = await supabase
      .from('tasks')
      .insert(processedTask)
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
    return data as Task;
  } catch (error) {
    console.error('Unexpected error creating task:', error);
    toast.error('Failed to create task');
    return null;
  }
};

/**
 * Update an existing task
 */
export const updateTask = async (id: number, taskInput: Partial<TaskInput>): Promise<Task | null> => {
  try {
    // 1. Validate status input
    const validStatuses: Task['status'][] = [
      'Not Started', 
      'In Progress', 
      'On Hold', 
      'Completed', 
      'Reviewed & Approved'
    ];
    
    if (taskInput.status && !validStatuses.includes(taskInput.status)) {
      throw new Error(`Invalid status: ${taskInput.status}`);
    }

    // 2. Prepare update data
    const updateData = {
      ...taskInput,
      // Ensure proper null handling for database constraints
      support_contact: taskInput.support_contact || null,
      notes: taskInput.notes || null,
      // Convert string arrays to database format
      dependencies: taskInput.dependencies ? String(taskInput.dependencies) : null,
      required_resources: taskInput.required_resources ? String(taskInput.required_resources) : null,
      performance_metrics: taskInput.performance_metrics ? String(taskInput.performance_metrics) : null
    };

    // 3. Execute Supabase update
    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    // 4. Handle Supabase errors
    if (error) {
      console.error('Supabase update error:', {
        code: error.code,
        message: error.message,
        details: error.details
      });
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from database');
    }

    // 5. Return properly formatted task
    return {
      ...data,
      status: data.status as Task['status'],
      priority: data.priority as Task['priority']
    };

  } catch (error) {
    console.error('Update task failed:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to update task');
    return null;
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (id: number): Promise<boolean> => {
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
