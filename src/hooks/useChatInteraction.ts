// This file manages the entire chat state and interaction logic
import { useEffect } from 'react';
import { useConversationStore } from '@/store/conversationStore';
import { SYSTEM_PROMPTS } from '@/types/chat';

export function useChatInteraction() {
  // Get all data from our store
  const {
    messages,
    context,
    isLoading,
    error,
    addMessage,
    setLoading,
    setError,
    transitionToNextState
  } = useConversationStore();

  // Add first initial message
  useEffect(() => {
    if (messages.length === 0) {
      addMessage({
        id: `ai-${Date.now()}`,
        content: "What's your side?",
        isUser: false,
        timestamp: new Date()
      });
    }
  }, [messages.length, addMessage]);

  // Called whenever user sends a message
  const sendMessage = async (prompt: string) => {
    setError(null);
    if (!prompt.trim()) {
      setError("Message cannot be empty");
      return;
    }

    // Create and add user's message
    const userMessage = {
      id: `user-${Date.now()}`,
      content: prompt,
      isUser: true,
      timestamp: new Date()
    };
    addMessage(userMessage);
    setLoading(true);

    try {
      // Send request to our API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          conversationHistory: messages,
          // Get system instructions based on current state
          systemInstructions: SYSTEM_PROMPTS[context.state].instructions
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Create and add AI's response message
      const aiMessage = {
        id: `ai-${Date.now()}`,
        content: data.message,
        isUser: false,
        timestamp: new Date()
      };
      addMessage(aiMessage);

      // Transition to the next state
      if (context.state === 'understanding' && data.message.includes(('Got it.'))) {
        transitionToNextState();
      }

    } catch (err) {
      // Handle any errors that occurred
      console.error('Chat Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      
      // Add error message to chat
      addMessage({
        id: `error-${Date.now()}`,
        content: "Sorry, I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date()
      });
    } finally {
      // Always stop loading, whether request succeeded or failed
      setLoading(false);
    }
  };
  return {
    messages,
    sendMessage,
    isLoading,
    error,
    currentState: context.state
  };
}