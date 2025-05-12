import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex gap-3 mb-4">
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
        <span className="h-4 w-4 bg-primary/20"></span>
      </div>
      <div className="chat-message-bot">
        <div className="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
