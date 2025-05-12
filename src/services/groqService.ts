import { Task } from '@/types/database.types';
import axios from 'axios';


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
    this.apiKey = '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';
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
          
        const priority = lastUserMessage.includes('high') ? 'High' : 
                        lastUserMessage.includes('medium') ? 'Medium' : 
                        'Low';

        response = `I'll add a new task for you called "${title}".`;
        action = { 
          operation: 'insert', 
          table: 'tasks', 
          data: { 
            title,
            description: "Task description",
            category: "General",
            priority,
            expected_outcome: "Successful completion",
            deadline: new Date().toISOString(),
            estimated_time: "1 hour",
            instructions: "Follow standard procedures",
            review_process: "Manager review required",
            notes: "No additional notes",
            status: "Not Started"
          }
        };
      } else if (lastUserMessage.includes('contact')) {
        const name = lastUserMessage.split(/add|create/)[1].trim() || "New Contact";
        response = `I'll add a new contact named "${name}".`;
        action = { 
          operation: 'insert', 
          table: 'contacts', 
          data: { 
            name,
            phone: 1234567890,
            email: "email@example.com",
            address: "Address not provided",
            skills: []
          }
        };
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
1. tasks - Fields: 
   - id (BIGSERIAL), 
   - title (text) NOT NULL,
   - description (text) NOT NULL,
   - category (text) NOT NULL,
   - priority (text) NOT NULL CHECK (priority IN ('Low', 'Medium', 'High')),
   - expected_outcome (text) NOT NULL,
   - deadline (timestamptz) NOT NULL,
   - assigned_to (BIGINT) REFERENCES contacts(id),
   - dependencies (jsonb) NOT NULL DEFAULT '[]'::jsonb,
   - required_resources (jsonb) NOT NULL DEFAULT '[]'::jsonb,
   - estimated_time (text) NOT NULL,
   - instructions (text) NOT NULL,
   - review_process (text) NOT NULL,
   - performance_metrics (jsonb) NOT NULL DEFAULT '[]'::jsonb,
   - support_contact (BIGINT) REFERENCES contacts(id),
   - notes (text) NOT NULL,
   - status (text) NOT NULL CHECK (status IN ('Not Started', 'In Progress', 'On Hold', 'Completed', 'Reviewed & Approved')),
   - created_at (timestamptz) DEFAULT NOW(),
   - updated_at (timestamptz) DEFAULT NOW(),
   - started_at (timestamptz),
   - completed_at (timestamptz)

2. contacts - Fields:
   - id (BIGSERIAL),
   - name (text) NOT NULL,
   - phone (bigint) NOT NULL,
   - email (text) NOT NULL,
   - address (text) NOT NULL,
   - skills (jsonb) NOT NULL DEFAULT '[]'::jsonb,
   - created_at (timestamptz) DEFAULT NOW(),
   - updated_at (timestamptz) DEFAULT NOW()

RULES:
1. Always respond in a helpful, professional tone and dont simulate and assume things on your own always ask for clarifications.
2. When a user requests database operations, format your response with both human-readable explanation and a structured JSON block.
3. Extract as much specific information as possible from user queries to populate database actions accurately.
4. Always validate input - ensure required fields are present and data types match the schema.
5. Provide confirmation of actions and clear error messages if something goes wrong.
6. When showing data, present it in a well-organized, readable format.
7. For ambiguous requests, ask clarifying questions before taking action.

DATABASE ACTION FORMAT:
\`\`\`json
{
  "operation": "select|insert|update|delete",
  "table": "tasks|contacts",
  "where": { "id": "numeric-value" },  // For update/delete operations
  "data": {                           // For insert/update operations
    "field1": "value1",
    "field2": "value2"
  }
}
\`\`\`

Example 1 - User asks: "Show me all my tasks"
Response includes:
\`\`\`json
{
  "operation": "select",
  "table": "tasks"
}
\`\`\`

Example 2 - User asks: "Add a new task to call John tomorrow with High priority"
Response includes:
\`\`\`json
{
  "operation": "insert",
  "table": "tasks",
  "data": {
    "title": "Call John",
    "description": "Schedule important client call",
    "category": "Communication",
    "priority": "High",
    "expected_outcome": "Confirm project timeline",
    "deadline": "2024-05-16T15:00:00Z",
    "estimated_time": "30 minutes",
    "instructions": "Prepare meeting agenda",
    "review_process": "Manager approval required",
    "notes": "Client reference #1234",
    "status": "Not Started"
  }
}
\`\`\`

Example 3 - User asks: "Update task 456 to In Progress"
Response includes:
\`\`\`json
{
  "operation": "update",
  "table": "tasks",
  "where": { "id": 456 },
  "data": {
    "status": "In Progress"
  }
}
\`\`\`

Example 4 - User asks: "Delete contact with ID 7"
Response includes:
\`\`\`json
{
  "operation": "delete",
  "table": "contacts",
  "where": { "id": 7 }
}
\`\`\`

Always ensure required fields are present and data types match the schema. Ask for clarification if needed.`;

    const messages = [...history, { role: "user" as const, content: message }];
    const response = await this.chatCompletion(messages, { systemPrompt });
    return response.content;
  }

  async generateTaskDetails(description: string): Promise<Partial<Task>> {
    const systemPrompt = `Analyze the task description and Generate task details with:
  - Deadline: Tomorrow's date (YYYY-MM-DD)
  - Realistic time estimates
  - Proper contact resolution
  Response format: {
    "description": "...",
    "category": "...",
    "expected_outcome": "...",
    "deadline": "YYYY-MM-DD",
    "estimated_time": "...",
    "instructions": "...",
    "review_process": "..."
  }`;
  
    const messages = [{
      role: "user" as const,
      content: `Task description: ${description}`
    }];
  
    const response = await this.chatCompletion(messages, {
      systemPrompt,
      temperature: 0.3  // More deterministic output
    });
  
    try {
      return JSON.parse(response.content.match(/\{[\s\S]*?\}/)?.[0] || "{}");
    } catch (error) {
      console.error("Error parsing AI suggestions:", error);
      return {};
    }
  }



  

  parseActionFromResponse(response: string): DatabaseAction | null {
    const validateWhereClause = (where: unknown): Record<string, unknown> | undefined => {
        if (!where || typeof where !== 'object') return undefined;
        return where as Record<string, unknown>;
    };

    const validateData = (data: unknown): Record<string, unknown> | undefined => {
        if (!data || typeof data !== 'object') return undefined;
        return data as Record<string, unknown>;
    };

    try {
        // 1. More resilient JSON extraction with multiple fallbacks
        const jsonMatch = response.match(
            /```(?:json)?\s*\n?([\s\S]*?)\n?```|({[\s\S]*?})/
        ) || [null, response];
        
        const rawContent = jsonMatch[1] || jsonMatch[0];
        if (!rawContent) {
            console.debug('No actionable content found');
            return null;
        }

        // 2. Enhanced cleaning pipeline
        const cleanJson = rawContent
            .replace(/(['"])?([a-z0-9_]+)(['"])?\s*:/gi, '"$2":')  // Unquoted keys
            .replace(/'/g, '"')                                     // Single quotes
            .replace(/\\/g, '\\\\')                                 // Escape backslashes
            .replace(/“/g, '"').replace(/”/g, '"')                  // Smart quotes
            .replace(/`/g, '"')                                    // Backticks
            .replace(/,\s*([}\]])/g, '$1')                         // Trailing commas
            .replace(/(\w+)\s*:/g, '"$1":')                        // Unquoted keys
            .replace(/:\s*'([^']+)'/g, ': "$1"')                   // Single quoted values
            .replace(/:\s*([^"{[\d][^,}\]]*)(?=\s*[,}\]])/g, ': "$1"'); // Unquoted string values

        // 3. Debug logging
        console.debug('Cleaned JSON:', cleanJson);

        // 4. Safe parsing with validation
        const parsed = JSON.parse(cleanJson);
        
        // 5. Validate operation
        const operation = parsed.operation?.toString().toLowerCase();
        if (!['select', 'insert', 'update', 'delete'].includes(operation)) {
            throw new Error(`Invalid operation: ${parsed.operation}`);
        }

        // 6. Validate table
        const table = parsed.table?.toString().toLowerCase();
        if (!['tasks', 'contacts'].includes(table)) {
            throw new Error(`Invalid table: ${parsed.table}`);
        }

        // 7. Process dates for tasks
        if (table === 'tasks' && parsed.data?.deadline) {
            parsed.data.deadline = this.parseNaturalDate(parsed.data.deadline);
        }

        // 8. Return normalized action
        return {
            operation: operation as DatabaseAction['operation'],
            table: table as DatabaseAction['table'],
            where: validateWhereClause(parsed.where),
            data: validateData(parsed.data)
        };

    } catch (error) {
        console.error('JSON parsing failed:', error);
        console.debug('Original response snippet:', response.slice(0, 200));
        return null;
    };
}

private parseNaturalDate(dateString: string): string {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) return date.toISOString();
    
    // Handle natural language dates
    const lowerDate = dateString.toLowerCase();
    const today = new Date();
    
    if (lowerDate.includes('tomorrow')) {
        today.setDate(today.getDate() + 1);
    } else if (lowerDate.includes('next week')) {
        today.setDate(today.getDate() + 7);
    } else if (lowerDate.includes('next month')) {
        today.setMonth(today.getMonth() + 1);
    }
    
    today.setHours(23, 59, 59, 999);  // End of day
    return today.toISOString();
}

}

export const groqService = new GroqService();

import { DatabaseTable } from '@/types/database.types';
