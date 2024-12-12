import React, { useState } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-md flex"
    >
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask me anything..."
        disabled={isLoading}
        className="flex-grow p-2 border rounded-l-lg 
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   disabled:opacity-50"
      />
      <button 
        type="submit" 
        disabled={isLoading || input.trim() === ''}
        className="bg-blue-500 text-white p-2 rounded-r-lg 
                   hover:bg-blue-600 
                   disabled:bg-blue-300 
                   transition-colors duration-200"
      >
        {isLoading ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
}