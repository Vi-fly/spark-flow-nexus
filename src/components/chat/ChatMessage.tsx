import { Message } from '@/services/groqService';
import { Bot, User } from 'lucide-react';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import DataTable from './DataTable';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  // Check if the message contains data that should be displayed as a table
  const extractTableData = (content: string) => {
    const jsonRegex = /```\n([\s\S]*?)\n```/g;
    const match = jsonRegex.exec(content);
    
    if (match && match[1]) {
      try {
        const parsedData = JSON.parse(match[1]);
        // Fix: Explicitly type the return value to ensure type safety
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          // Determine if it's tasks or contacts based on the data structure
          const type = Object.prototype.hasOwnProperty.call(parsedData[0], 'title') ? 'tasks' : 'contacts';
          return { data: parsedData, type: type as 'tasks' | 'contacts' };
        }
        return null;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  // Clean the message content to remove JSON code blocks before display
  const cleanContent = (content: string) => {
    // If there's a JSON block in the message, remove it for display
    if (!isUser && content.includes('```')) {
      return content.replace(/```[\s\S]*?```/g, '');
    }
    return content;
  };

  const tableData = !isUser ? extractTableData(message.content) : null;

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Bot size={18} className="text-primary" />
        </div>
      )}
      
      <div className={`max-w-[85%] rounded-lg p-3 ${isUser 
        ? 'bg-primary text-primary-foreground' 
        : 'bg-muted'}`}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{message.content}</div>
        ) : (
          <>
            <ReactMarkdown
              components={{
                pre: ({ node, ...props }) => (
                  <div className="my-2 rounded overflow-auto">
                    <pre {...props} />
                  </div>
                ),
                code: ({ node, ...props }) => (
                  <code className="bg-black/10 px-1 py-0.5 rounded text-sm" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc pl-6 my-2" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal pl-6 my-2" {...props} />
                ),
                h1: ({ node, ...props }) => (
                  <h1 className="text-xl font-bold my-2" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-lg font-bold my-2" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-md font-bold my-2" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="my-2" {...props} />
                )
              }}
            >
              {cleanContent(message.content)}
            </ReactMarkdown>
            
            {tableData && (
              <div className="mt-4">
                <DataTable data={tableData.data} type={tableData.type} />
              </div>
            )}
          </>
        )}
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
          <User size={18} />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;