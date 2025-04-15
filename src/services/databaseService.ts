import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseTable, DatabaseColumn, Task, Contact } from '@/types/database.types';

class DatabaseService {
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

  /**
   * Get table structure (columns)
   * @param tableName The name of the table
   */
  async getTableColumns(tableName: string): Promise<DatabaseColumn[]> {
    try {
      if (tableName === 'tasks') {
        return [
          { name: 'id', type: 'uuid', isNullable: false },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'title', type: 'text', isNullable: false },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'status', type: 'text', isNullable: false },
          { name: 'priority', type: 'text', isNullable: false },
          { name: 'deadline', type: 'timestamptz', isNullable: true },
          { name: 'estimated_time', type: 'text', isNullable: true },
          { name: 'assigned_to', type: 'uuid', isNullable: true },
          { name: 'contact_id', type: 'uuid', isNullable: true },
          { name: 'created_at', type: 'timestamptz', isNullable: true },
          { name: 'updated_at', type: 'timestamptz', isNullable: true }
        ];
      } else if (tableName === 'contacts') {
        return [
          { name: 'id', type: 'uuid', isNullable: false },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'name', type: 'text', isNullable: false },
          { name: 'email', type: 'text', isNullable: true },
          { name: 'phone', type: 'text', isNullable: true },
          { name: 'role', type: 'text', isNullable: true },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'address', type: 'text', isNullable: true },
          { name: 'skills', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamptz', isNullable: true },
          { name: 'updated_at', type: 'timestamptz', isNullable: true },
          { name: 'company', type: 'text', isNullable: true }
        ];
      }
      return [];
    } catch (error) {
      console.error('Error fetching table columns:', error);
      return [];
    }
  }

  async getTableData(tableName: string): Promise<any[]> {
    try {
      const { data, error } = await supabase.from(tableName).select('*');
      
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
    const { data, error } = await supabase.rpc('execute_sql', { sql_query: query });
    
    if (error) {
      console.error('Error executing query:', error);
      throw new Error(error.message);
    }
    
    return data;
  }

  /**
   * Get current user ID or generate a temporary one
   */
  private async getCurrentUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      return user.id;
    }
    
    // Use a consistent UUID from local storage if no authenticated user
    let tempUserId = localStorage.getItem('temp_user_id');
    if (!tempUserId) {
      tempUserId = uuidv4();
      localStorage.setItem('temp_user_id', tempUserId);
    }
    return tempUserId;
  }

  async addTask(task: Task): Promise<Task> {
    try {
      if (!task.user_id || task.user_id === 'current-user') {
        task.user_id = await this.getCurrentUserId();
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single();
      
      if (error) throw error;
      return data as Task;
    } catch (error: any) {
      console.error('Error in addTask:', error);
      if (error.message?.includes('Failed to fetch')) {
        return {
          ...task,
          id: uuidv4(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as Task;
      }
      throw error;
    }
  }

  /**
   * Update a task
   * @param id The task ID
   * @param task The task data to update
   */
  async updateTask(id: string, task: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(task)
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
  async deleteTask(id: string): Promise<void> {
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
      // Ensure user_id is set
      if (!contact.user_id || contact.user_id === 'current-user') {
        contact.user_id = await this.getCurrentUserId();
      }
      
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
          id: uuidv4(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
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
  async updateContact(id: string, contact: Partial<Contact>): Promise<Contact> {
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
  async deleteContact(id: string): Promise<void> {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting contact:', error);
      throw new Error(error.message);
    }
  }

  async executeAction(action: any): Promise<any> {
    if (!action || !action.operation) {
      throw new Error('Invalid operation requested');
    }

    try {
      switch (action.operation) {
        case 'select':
          return this.getTableData(action.table);
          
        case 'insert':
          if (action.table === 'tasks') {
            const taskData = {
              ...action.data,
              status: action.data.status || 'todo',
              priority: action.data.priority || 'medium',
              user_id: 'current-user'
            };
            return this.addTask(taskData);
          } else if (action.table === 'contacts') {
            return this.addContact({
              ...action.data,
              user_id: 'current-user'
            });
          }
          break;
          
        case 'update':
          if (!action.where?.id) {
            throw new Error('Missing ID for update operation');
          }
          
          if (action.table === 'tasks') {
            return this.updateTask(action.where.id, action.data);
          } else if (action.table === 'contacts') {
            return this.updateContact(action.where.id, action.data);
          }
          break;
          
        case 'delete':
          if (!action.where?.id) {
            throw new Error('Missing ID for delete operation');
          }
          
          if (action.table === 'tasks') {
            return this.deleteTask(action.where.id);
          } else if (action.table === 'contacts') {
            return this.deleteContact(action.where.id);
          }
          break;
          
        default:
          throw new Error('Unsupported operation');
      }
    } catch (error: any) {
      console.error('Error executing database action:', error);
      if (error.message?.includes('Failed to fetch')) {
        if (action.operation === 'select') {
          return action.table === 'tasks' 
            ? [{ id: '123', title: 'Example Task', status: 'todo', priority: 'medium' }]
            : [{ id: '456', name: 'Example Contact', email: 'example@example.com' }];
        }
        return { success: true, message: 'Operation simulated for demo' };
      }
      throw error;
    }
  }
}

export const databaseService = new DatabaseService();
