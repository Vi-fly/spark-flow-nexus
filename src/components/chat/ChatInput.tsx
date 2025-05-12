import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb, Send } from 'lucide-react';
import React, { useState } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

const EXAMPLE_QUERIES = [
  "Show me all my tasks",
  "Add a new task to prepare meeting agenda for tomorrow with high priority",
  "List all contacts from Acme Inc",
  "Update task with ID 123 to status done",
  "Create a contact for Jane Smith with email jane@example.com",
  "Find all high priority tasks due this week",
  "Delete task with ID 456"
];

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading,
  placeholder = "Ask about your database or request changes..." 
}) => {
  const [message, setMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedExample, setSelectedExample] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleExampleClick = (example: string) => {
    setMessage(example);
    setSelectedExample(example);
    setShowSuggestions(false);
    // Focus the textarea
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.focus();
    }
  };

  return (
    <div className="border-t bg-background p-4 space-y-2">
      {showSuggestions && (
        <div className="pb-2 pt-1">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Lightbulb size={14} />
            <span>Example queries:</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className={`text-xs px-2 py-1 rounded-full border transition-colors
                  ${selectedExample === example 
                    ? 'bg-primary/20 border-primary/30' 
                    : 'hover:bg-muted bg-background border-input'}`}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="resize-none min-h-[60px] pr-8"
            disabled={isLoading}
            onFocus={() => setShowSuggestions(true)}
          />
          <Button 
            type="button"
            size="icon"
            variant="ghost"
            className="absolute right-2 bottom-2 h-6 w-6"
            onClick={() => setShowSuggestions(!showSuggestions)}
          >
            <Lightbulb size={14} className={showSuggestions ? "text-primary" : "text-muted-foreground"} />
          </Button>
        </div>
        <Button type="submit" size="icon" disabled={!message.trim() || isLoading}>
          <Send size={18} />
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;