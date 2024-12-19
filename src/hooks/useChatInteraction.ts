// This file manages the entire chat state and interaction logic

import { useState } from 'react';
import { ChatMessage } from '@/types/chat';

export function useChatInteraction() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Called whenever user sends a message
  const sendMessage = async (prompt: string) => {
    setError(null);
    if (!prompt.trim()) {
      setError("Message cannot be empty");
      return;
    }
    // Create user message object
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: prompt,
      isUser: true,
      timestamp: new Date()
    };
    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    try {
      // Send request to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          conversationHistory: messages
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }
      // Create AI message object
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        content: data.message,
        isUser: false,
        timestamp: new Date()
      };
      // Add AI message to chat
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Chat Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Create error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: "Sorry, I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date()
      };
      // Add error message to chat
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  return {
    messages,
    sendMessage,
    isLoading,
    error
  };
}