import axios from 'axios';
import { DatabaseTable } from '@/types/database.types';

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatOptions {
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  onMessageUpdate?: (message: string) => void;
}

export interface DatabaseAction {
  operation: 'select' | 'insert' | 'update' | 'delete';
  table: string;
  where?: Record<string, any>;
  data?: Record<string, any>;
}

class GroqService {
  private apiKey: string;
  private baseURL: string = 'https://api.groq.com/openai/v1/chat/completions';
  private fallbackMode: boolean = false;
  
  constructor() {
    // For security, we'll get the API key from environment or Supabase later
    this.apiKey = process.env.GROQ_API_KEY || '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';
    if (!this.apiKey) {
      console.warn('GROQ API key is not set. Using fallback mode.');
      this.fallbackMode = true;
    }
  }

  async chatCompletion(
    messages: Message[],
    options: ChatOptions = {}
  ): Promise<Message> {
    const {
      systemPrompt,
      maxTokens = 4000,
      temperature = 0.7,
      topP = 0.9,
      onMessageUpdate
    } = options;

    const fullMessages = systemPrompt
      ? [{ role: "system" as const, content: systemPrompt }, ...messages]
      : messages;

    if (this.fallbackMode) {
      console.log('Using fallback mode for chat completion');
      return this.generateFallbackResponse(fullMessages, onMessageUpdate);
    }

    try {
      const response = await axios.post(
        this.baseURL,
        {
          model: "llama-3.3-70b-versatile",
          messages: fullMessages,
          max_tokens: maxTokens,
          temperature,
          top_p: topP,
          stream: !!onMessageUpdate
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          responseType: onMessageUpdate ? 'stream' : 'json'
        }
      );

      if (onMessageUpdate) {
        let fullContent = '';
        const stream = response.data;
        
        stream.on('data', (chunk: Buffer) => {
          const lines = chunk
            .toString('utf8')
            .split('\n')
            .filter(line => line.trim().startsWith('data: '));
          
          for (const line of lines) {
            const data = line.replace(/^data: /, '').trim();
            
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              
              if (content) {
                fullContent += content;
                onMessageUpdate(fullContent);
              }
            } catch (e) {
              console.error('Error parsing SSE chunk:', e);
            }
          }
        });
        
        return new Promise((resolve) => {
          stream.on('end', () => {
            resolve({ role: "assistant", content: fullContent });
          });
        });
      } else {
        const content = response.data.choices[0].message.content;
        return { role: "assistant", content };
      }
    } catch (error) {
      console.error('Error calling GROQ API:', error);
      return this.generateFallbackResponse(fullMessages, onMessageUpdate);
    }
  }

  private async generateFallbackResponse(messages: Message[], onMessageUpdate?: (message: string) => void): Promise<Message> {
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content.toLowerCase() || '';
    
    let response: string;
    let action: DatabaseAction | null = null;
    
    if (lastUserMessage.includes('show') || lastUserMessage.includes('list') || lastUserMessage.includes('get')) {
      if (lastUserMessage.includes('task')) {
        response = "Here are your tasks:";
        action = { operation: 'select', table: 'tasks' };
      } else if (lastUserMessage.includes('contact')) {
        response = "Here are your contacts:";
        action = { operation: 'select', table: 'contacts' };
      } else {
        response = "I can show you your tasks or contacts. Which would you like to see?";
      }
    } else if (lastUserMessage.includes('add') || lastUserMessage.includes('create')) {
      if (lastUserMessage.includes('task')) {
        const title = lastUserMessage.includes('called') || lastUserMessage.includes('named') 
          ? lastUserMessage.split(/called|named/)[1].trim() 
          : "New Task";
          
        const priority = lastUserMessage.includes('high') ? 'high' : 
                        lastUserMessage.includes('medium') ? 'medium' : 
                        lastUserMessage.includes('low') ? 'low' : 'medium';

        response = `I'll add a new task for you called "${title}".`;
        action = { 
          operation: 'insert', 
          table: 'tasks', 
          data: { 
            title,
            status: 'todo', 
            priority,
            user_id: 'current-user'
          }
        };
      } else if (lastUserMessage.includes('contact')) {
        response = "I can help you add a contact. Please provide a name for the contact.";
      } else {
        response = "I can add a new task or contact for you. What would you like to add?";
      }
    } else {
      response = "I can help you manage your tasks and contacts. You can ask me to show, add, update, or delete tasks and contacts.";
    }
    
    if (onMessageUpdate) {
      const words = response.split(' ');
      let partialResponse = '';
      
      for (const word of words) {
        await new Promise(resolve => setTimeout(resolve, 50));
        partialResponse += word + ' ';
        onMessageUpdate(partialResponse);
      }
    }

    if (action) {
      response += "\n\n```json\n" + JSON.stringify(action, null, 2) + "\n```";
    }
    
    return { role: "assistant", content: response };
  }

  async processMessage(
    message: string, 
    context: { tables: DatabaseTable[] }, 
    history: Message[]
  ): Promise<string> {
    const systemPrompt = `You are TaskBot, a highly intelligent AI assistant specialized in database management for tasks and contacts.

AVAILABLE DATABASE SCHEMA:
1. tasks - Fields: id (uuid), user_id (uuid), title (text), description (text), status (text), priority (text), deadline (timestamptz), estimated_time (text), assigned_to (uuid), contact_id (uuid), created_at (timestamptz), updated_at (timestamptz)
2. contacts - Fields: id (uuid), user_id (uuid), name (text), email (text), phone (text), role (text), notes (text), address (text), skills (text), created_at (timestamptz), updated_at (timestamptz), company (text)

TASK STATUSES: "todo", "in_progress", "done", "canceled"
TASK PRIORITIES: "low", "medium", "high", "urgent"

RULES:
1. Always respond in a helpful, professional tone.
2. When a user requests database operations, format your response with both human-readable explanation and a structured JSON block.
3. Extract as much specific information as possible from user queries to populate database actions accurately.
4. Always validate input - ensure required fields are present and data types match the schema.
5. Provide confirmation of actions and clear error messages if something goes wrong.
6. When showing data, present it in a well-organized, readable format.
7. Never expose sensitive database implementation details to users.
8. Always include appropriate error handling in your responses.
9. For ambiguous requests, ask clarifying questions before taking action.

DATABASE ACTION FORMAT:
\`\`\`json
{
  "operation": "select|insert|update|delete",
  "table": "tasks|contacts",
  "where": { "id": "uuid-value" },    // For update/delete operations
  "data": {                           // For insert/update operations
    "field1": "value1",
    "field2": "value2"
  }
}
\`\`\`

EXAMPLES:

Example 1 - User asks: "Show me all my tasks"
Response includes:
\`\`\`json
{
  "operation": "select",
  "table": "tasks"
}
\`\`\`

Example 2 - User asks: "Add a new task to call John tomorrow with high priority"
Response includes:
\`\`\`json
{
  "operation": "insert",
  "table": "tasks",
  "data": {
    "title": "Call John",
    "description": "Follow up call with John",
    "status": "todo",
    "priority": "high",
    "deadline": "2023-05-16T00:00:00Z"
  }
}
\`\`\`

Example 3 - User asks: "Update task 123 to in progress"
Response includes:
\`\`\`json
{
  "operation": "update",
  "table": "tasks",
  "where": { "id": "123" },
  "data": {
    "status": "in_progress"
  }
}
\`\`\`

Example 4 - User asks: "Delete contact with ID abc123"
Response includes:
\`\`\`json
{
  "operation": "delete",
  "table": "contacts",
  "where": { "id": "abc123" }
}
\`\`\`

Always strive to understand the user's intent and provide both helpful information and the correct database action JSON.`;

    const messages = [...history, { role: "user" as const, content: message }];

    const response = await this.chatCompletion(messages, { systemPrompt });
    
    return response.content;
  }

  parseActionFromResponse(response: string): DatabaseAction | null {
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    
    if (!jsonMatch || !jsonMatch[1]) {
      return null;
    }
    
    try {
      const action = JSON.parse(jsonMatch[1]);
      
      if (action.operation && action.table) {
        return action as DatabaseAction;
      }
    } catch (error) {
      console.error('Error parsing database action:', error);
    }
    
    return null;
  }
}

export const groqService = new GroqService();
