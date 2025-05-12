
/**
 * Contact Service - Handles all contact-related data operations with Supabase
 */
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define Contact type based on database structure
export type Contact = {
  id?: number;
  name: string;
  phone?: number ;
  email?: string;
  address?: string;
  skills: string[];
  notes: string;
};

// Define Contact input type for creation/updates
export type ContactInput = Omit<Contact, 'id' | 'created_at' | 'updated_at'>;

/**
 * Fetch all contacts for the current user
 */
export const getAllContacts = async (): Promise<Contact[]> => {
  try {
    // Get contacts from Supabase
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('name');
    
    // Handle errors
    if (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contacts');
      return [];
    }
    
    // Return the contacts
    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching contacts:', error);
    toast.error('Failed to load contacts');
    return [];
  }
};

/**
 * Create a new contact
 */
export const createContact = async (contactInput: ContactInput): Promise<Contact | null> => {
  try {
    // Get the user's ID from the auth context
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('You must be logged in to create a contact');
      return null;
    }
    
    // Prepare the contact with the user_id
    const contact = {
      ...contactInput,
      // user_id: user.id
    };
    
    // Insert contact into Supabase
    const { data, error } = await supabase
      .from('contacts')
      .insert(contact)
      .select()
      .single();
    
    // Handle errors
    if (error) {
      console.error('Error creating contact:', error);
      toast.error('Failed to create contact');
      return null;
    }
    
    // Show success message
    toast.success('Contact created successfully');
    
    // Return the created contact
    return data;
  } catch (error) {
    console.error('Unexpected error creating contact:', error);
    toast.error('Failed to create contact');
    return null;
  }
};

/**
 * Update an existing contact
 */
export const updateContact = async (id: number, contact: Partial<ContactInput>): Promise<Contact | null> => {
  try {
    // Update contact in Supabase
    const { data, error } = await supabase
      .from('contacts')
      .update(contact)
      .eq('id', id)
      .select()
      .single();
    
    // Handle errors
    if (error) {
      console.error('Error updating contact:', error);
      toast.error('Failed to update contact');
      return null;
    }
    
    // Show success message
    toast.success('Contact updated successfully');
    
    // Return the updated contact
    return data;
  } catch (error) {
    console.error('Unexpected error updating contact:', error);
    toast.error('Failed to update contact');
    return null;
  }
};

/**
 * Delete a contact
 */
export const deleteContact = async (id: number): Promise<boolean> => {
  try {
    // Delete contact from Supabase
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);
    
    // Handle errors
    if (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact');
      return false;
    }
    
    // Show success message
    toast.success('Contact deleted successfully');
    
    return true;
  } catch (error) {
    console.error('Unexpected error deleting contact:', error);
    toast.error('Failed to delete contact');
    return false;
  }
};
