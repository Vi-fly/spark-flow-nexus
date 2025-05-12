import { supabase } from '@/integrations/supabase/client';
import { Contact, DatabaseColumn, DatabaseTable, Task } from '@/types/database.types';

// export interface DatabaseTable {
//   name: string;
//   schema: string;
// }

// export interface DatabaseColumn {
//   name: string;
//   type: string;
//   isNullable: boolean;
//   defaultValue?: any; // Optional property to handle default values

// }

// export interface TableData {
//   rows: any[];
//   columns: DatabaseColumn[];
// }

// export type Task= {
//   id?: number;
//   title: string;
//   description: string;
//   category: string;
//   priority: 'Low' | 'Medium' | 'High';
//   expected_outcome: string;
//   deadline: string | Date;
//   assigned_to?: number | null;
//   dependencies?: any[];
//   required_resources?: any[];
//   estimated_time: string;
//   instructions: string;
//   review_process: string;
//   performance_metrics?: any[];
//   support_contact?: number | null;
//   notes: string;
//   status: 'Not Started' | 'In Progress' | 'On Hold' | 'Completed' | 'Reviewed & Approved';
//   started_at?: string | Date | null;
//   completed_at?: string | Date | null;
// }

// export type Contact = {
//   id?: number;
//   name: string;
//   phone: number | null;
//   email: string | null;
//   address: string;
//   skills?: string | null;
// }

class DatabaseService {
  private taskCounter: number = 1;
  private contactCounter: number = 1;

  constructor() {
    // Initialize counters from localStorage if available
    const savedTaskCounter = localStorage.getItem('task_counter');
    const savedContactCounter = localStorage.getItem('contact_counter');
    
    if (savedTaskCounter) {
      this.taskCounter = parseInt(savedTaskCounter, 10);
    }
    
    if (savedContactCounter) {
      this.contactCounter = parseInt(savedContactCounter, 10);
    }
  }

  /**
   * Get a list of available tables in the database
   */
  async getTables(): Promise<DatabaseTable[]> {
    try {
      // For this specific implementation, we'll return the known tables
      return [
        { name: 'tasks', schema: 'public' },
        { name: 'contacts', schema: 'public' }
      ];
    } catch (error) {
      console.error('Error fetching tables:', error);
      return [];
    }
  }

  // Add to DatabaseService class
  async findContactByName(name: string): Promise<Contact | null> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .ilike('name', `%${name}%`)
        .limit(1)
        .single();

      return error ? null : data as Contact;
    } catch (error) {
      console.error('Contact lookup error:', error);
      return null;
    }
  }

  /**
   * Get table structure (columns)
   * @param tableName The name of the table
   */
  async getTableColumns(tableName: string): Promise<DatabaseColumn[]> {
    try {
      if (tableName === 'tasks') {
        return [
          // Tasks table schema
          { name: 'id', type: 'integer', isNullable: false },
          { name: 'title', type: 'text', isNullable: false },
          { name: 'description', type: 'text', isNullable: false },
          { name: 'category', type: 'text', isNullable: false },
          { name: 'priority', type: 'text', isNullable: false },  // ENUM handled by CHECK constraint
          { name: 'expected_outcome', type: 'text', isNullable: false },
          { name: 'deadline', type: 'timestamptz', isNullable: false },
          { name: 'assigned_to', type: 'integer', isNullable: true },  // FK to contacts
          { name: 'dependencies', type: 'TEXT', isNullable: true },
          { name: 'required_resources', type: 'jsonb', isNullable: true },
          { name: 'estimated_time', type: 'text', isNullable: false },
          { name: 'instructions', type: 'text', isNullable: false },
          { name: 'review_process', type: 'text', isNullable: false },
          { name: 'performance_metrics', type: 'jsonb', isNullable: true },
          { name: 'support_contact', type: 'integer', isNullable: true },  // FK to contacts
          { name: 'notes', type: 'text', isNullable: false },
          { name: 'status', type: 'text', isNullable: false },  // ENUM handled by CHECK constraint
          { name: 'created_at', type: 'timestamptz', isNullable: false, defaultValue: 'NOW()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, defaultValue: 'NOW()' },
          { name: 'started_at', type: 'timestamptz', isNullable: true },
          { name: 'completed_at', type: 'timestamptz', isNullable: true }
        ];
        
        } else if (tableName === 'contacts') {
          return [
            // Contacts table schema
            { name: 'id', type: 'integer', isNullable: false },
            { name: 'name', type: 'text', isNullable: false },
            { name: 'email', type: 'text', isNullable: true },
            { name: 'phone', type: 'text', isNullable: true },
            { name: 'role', type: 'text', isNullable: true },
            { name: 'company', type: 'text', isNullable: true },
            { name: 'skills', type: 'text', isNullable: true },  // Array would need special handling
            { name: 'address', type: 'text', isNullable: true },
            { name: 'notes', type: 'text', isNullable: true },
            { name: 'created_at', type: 'timestamptz', isNullable: false, defaultValue: 'NOW()' },
            { name: 'updated_at', type: 'timestamptz', isNullable: false, defaultValue: 'NOW()' }
        ];
      }
      return [];
    } catch (error) {
      console.error('Error fetching table columns:', error);
      return [];
    }
  }

  /**
   * Get data from a specific table
   * @param tableName The name of the table
   */
  async getTableData(tableName: string): Promise<any[]> {
    try {
      // Type-safe approach: only allow specific table names
      if (tableName !== 'tasks' && tableName !== 'contacts') {
        console.error(`Invalid table name: ${tableName}`);
        return [];
      }
      
      // Now TypeScript knows tableName is either 'tasks' or 'contacts'
      const validTableName = tableName as 'tasks' | 'contacts';
      const { data, error } = await supabase.from(validTableName).select('*');
      
      if (error) {
        console.error(`Error fetching data from ${tableName}:`, error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error(`Error in getTableData for ${tableName}:`, error);
      return [];
    }
  }

  /**
   * Execute a custom SQL query
   * @param query SQL query string
   */
  async executeQuery(query: string): Promise<any> {
    try {
      // Fix: Use a proper type assertion for execute_sql RPC function
      // TypeScript doesn't know about custom RPC functions by default
      interface RPCFunctionReturnType {
        data: any;
        error: any;
      }

      // Using type assertions to inform TypeScript about the function
      const result = await (supabase.rpc as any)('execute_sql', { sql_query: query }) as RPCFunctionReturnType;
      
      if (result.error) {
        console.error('Error executing query:', result.error);
        throw new Error(result.error.message);
      }
      
      return result.data;
    } catch (error: unknown) {
      console.error('Error in executeQuery:', error);
      throw error;
    }
  }

  /**
   * Get current user ID or generate a temporary one
   */
  private async getCurrentUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      return user.id;
    }
    
    // Use a consistent ID from local storage if no authenticated user
    let tempUserId = localStorage.getItem('temp_user_id');
    if (!tempUserId) {
      tempUserId = 'guest-user';
      localStorage.setItem('temp_user_id', tempUserId);
    }
    return tempUserId;
  }

  /**
   * Add a new task
   * @param task The task data
   */
  async addTask(task: Task): Promise<Task> {
    try {
      
      
      // Convert any Date objects to strings for Supabase
      const taskToInsert = {
        ...task,
        deadline: task.deadline instanceof Date ? task.deadline.toISOString() : task.deadline,
      };
      
      // Don't need to assign ID as it's auto-incremented by the database
      const { data, error } = await supabase
        .from('tasks')
        .insert(taskToInsert as any)
        .select()
        .single();
      
      if (error) {
        console.error('Error adding task:', error);
        throw new Error(error.message);
      }
      
      return data as Task;
    } catch (error: any) {
      console.error('Error in addTask:', error);
      // Create mock response for demo/development when Supabase is not available
      if (error.message?.includes('Failed to fetch')) {
        const mockTask = {
          ...task,
          id: this.taskCounter++,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        localStorage.setItem('task_counter', this.taskCounter.toString());
        return mockTask as Task;
      }
      throw error;
    }
  }

  /**
   * Update a task
   * @param id The task ID
   * @param task The task data to update
   */
  async updateTask(id: number, task: Partial<Task>): Promise<Task> {
    // Convert any Date objects to strings for Supabase
    const taskToUpdate = {
      ...task,
      deadline: task.deadline instanceof Date ? task.deadline.toISOString() : task.deadline,
    };
    
    const { data, error } = await supabase
      .from('tasks')
      .update(taskToUpdate as any)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating task:', error);
      throw new Error(error.message);
    }
    
    return data as Task;
  }

  /**
   * Delete a task
   * @param id The task ID
   */
  async deleteTask(id: number): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting task:', error);
      throw new Error(error.message);
    }
  }

  /**
   * Add a new contact
   * @param contact The contact data
   */
  async addContact(contact: Contact): Promise<Contact> {
    try {
      
      
      // Don't need to assign ID as it's auto-incremented by the database
      const { data, error } = await supabase
        .from('contacts')
        .insert(contact)
        .select()
        .single();
      
      if (error) {
        console.error('Error adding contact:', error);
        throw new Error(error.message);
      }
      
      return data as Contact;
    } catch (error: any) {
      console.error('Error in addContact:', error);
      // Create mock response for demo/development when Supabase is not available
      if (error.message?.includes('Failed to fetch')) {
        const mockContact = {
          ...contact,
          id: this.contactCounter++,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        localStorage.setItem('contact_counter', this.contactCounter.toString());
        return mockContact as Contact;
      }
      throw error;
    }
  }

  /**
   * Update a contact
   * @param id The contact ID
   * @param contact The contact data to update
   */
  async updateContact(id: number, contact: Partial<Contact>): Promise<Contact> {
    const { data, error } = await supabase
      .from('contacts')
      .update(contact)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating contact:', error);
      throw new Error(error.message);
    }
    
    return data as Contact;
  }

  /**
   * Delete a contact
   * @param id The contact ID
   */
  // In databaseService.ts
  async deleteContact(id: number): Promise<void> {
    // Add proper error handling and confirmation
    const { data, error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete failed:', error);
      throw new Error(`Failed to delete contact: ${error.message}`);
    }
    
    
  }

  /**
   * Execute database operations requested by the user via natural language
   * @param action The processed action from Groq API
   */
  async executeAction(action: any): Promise<any> {
    if (!action || !action.operation) {
      throw new Error('Invalid operation requested');
    }

    try {
      switch (action.operation) {
        case 'select':
          if (action.table === 'tasks' || action.table === 'contacts') {
            return this.getTableData(action.table);
          }
          throw new Error(`Invalid table name: ${action.table}`);
          
        case 'insert':
          if (action.table === 'tasks') {
            // Ensure task has required fields
            const taskData = {
              ...action.data,
              status: action.data.status || 'todo',
              priority: action.data.priority || 'medium',
              // user_id: 'current-user'  // Will be replaced with actual user ID
            };
            return this.addTask(taskData);
          } else if (action.table === 'contacts') {
            const contactData = {
              ...action.data,
              // user_id: 'current-user'  // Will be replaced with actual user ID
            };
            return this.addContact(contactData);
          }
          throw new Error(`Invalid table name: ${action.table}`);
          
        case 'update':
          if (!action.where || !action.where.id) {
            throw new Error('Missing ID for update operation');
          }
          
          if (action.table === 'tasks') {
            return this.updateTask(action.where.id, action.data);
          } else if (action.table === 'contacts') {
            return this.updateContact(action.where.id, action.data);
          }
          throw new Error(`Invalid table name: ${action.table}`);
          
        case 'delete':
          if (!action.where || !action.where.id) {
            throw new Error('Missing ID for delete operation');
          }
          
          if (action.table === 'tasks') {
            return this.deleteTask(action.where.id);
          } else if (action.table === 'contacts') {
            return this.deleteContact(action.where.id);
          }
          throw new Error(`Invalid table name: ${action.table}`);
          
        default:
          throw new Error('Unsupported operation');
      }
    } catch (error) {
      console.error('Error executing database action:', error);
      // For demo purposes, create mock responses when database is unavailable
      if (error.message?.includes('Failed to fetch')) {
        if (action.operation === 'select') {
          return action.table === 'tasks' 
            ? [{ id: 1, title: 'Example Task', status: 'todo', priority: 'medium' }]
            : [{ id: 1, name: 'Example Contact', email: 'example@example.com' }];
        }
        return { success: true, message: 'Operation simulated for demo' };
      }
      throw error;
    }
  }
}

export const databaseService = new DatabaseService();