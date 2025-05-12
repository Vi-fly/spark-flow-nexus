
import { supabase } from "@/integrations/supabase/client";

export type ChatMessage = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

type GroqApiResponse = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

/**
 * Fetch database context to provide to the AI
 */
export const fetchDatabaseContext = async (): Promise<string> => {
  try {
    // Fetch recent tasks summary
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, title, status, priority, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (tasksError) throw tasksError;

    // Fetch contacts summary
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (contactsError) throw contactsError;

    // Format database context
    return `
Database Summary:
- Total Tasks: ${tasks.length}
- Total Contacts: ${contacts.length}

Recent Tasks:
${tasks.map((task: { id: string; title: string; status: string; priority: string }) => `- ${task.title} (${task.status}, ${task.priority})`).join('\n')}

Recent Contacts:
${contacts.map((contact: { name: string; company?: string }) => `- ${contact.name} ${contact.company ? `(${contact.company})` : ''}`).join('\n')}
    `;
  } catch (error) {
    console.error('Error fetching database context:', error);
    return 'Unable to fetch database context.';
  }
};

/**
 * Get a response from the Groq API via our edge function
 */
export const getChatResponse = async (messages: { role: string; content: string }[]): Promise<string> => {
  try {
    // Fetch database context
    const dbContext = await fetchDatabaseContext();
    
    // Call the edge function
    const { data, error } = await supabase.functions.invoke('groq-chat', {
      body: { messages, dbContext },
    });

    if (error) {
      console.error('Error calling Groq API:', error);
      throw new Error(`Failed to get response: ${error.message}`);
    }
    
    const response = data as GroqApiResponse;
    
    if (response.choices && response.choices[0]) {
      return response.choices[0].message.content;
    }

    throw new Error('Invalid response format from Groq API');
  } catch (error) {
    console.error('Error in chat service:', error);
    throw error;
  }
};
