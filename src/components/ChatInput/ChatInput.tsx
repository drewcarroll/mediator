import React, { useState } from 'react';
import styles from './ChatInput.module.css';

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
      className={styles.form}
      onSubmit={handleSubmit}
    >
      <input
        className={styles.input}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask me anything..."
        disabled={isLoading}
      />
      <button
        className={styles.button}
        type="submit"
        disabled={isLoading || input.trim() === ''}
      >
        {isLoading ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
}