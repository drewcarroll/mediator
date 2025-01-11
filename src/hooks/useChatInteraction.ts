// Hook and store imports for managing chat state and side effects
import { useEffect } from 'react';
import { useConversationStore } from '@/store/conversationStore';
import { SYSTEM_PROMPTS, ConversationState, ChatMessage } from '@/types/chat';

// Custom hook to manage chat interactions for either left or right side of conversation
export function useChatInteraction(side: 'left' | 'right') {
  // Destructure required state and functions from conversation store
  const {
    messages: allMessages,
    contexts,
    isLoading,
    error,
    completion,
    addMessage,
    setLoading,
    setError,
    setCompletion
  } = useConversationStore();

  // Filter messages for current side and get current context state
  const messages = allMessages.filter(msg => msg.side === side);
  const currentContext = contexts[side];
  const currentLoading = isLoading[side];
  const currentError = error[side];
  const isComplete = completion[side];

  // Initialize chat with welcome message if empty
  useEffect(() => {
    if (messages.length === 0) {
      addMessage({
        id: `ai-${Date.now()}`,
        content: "What seems to be the issue?",
        isUser: false,
        timestamp: new Date(),
        side
      });
    }
  }, [messages.length, addMessage, side]);

  // Main function to send messages and handle responses
  const sendMessage = async (prompt: string) => {
    // Clear any existing errors and validate input
    setError(side, null);
    if (!prompt.trim()) {
      setError(side, "Message cannot be empty");
      return;
    }

    // Create and add user message to conversation
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: prompt,
      isUser: true,
      timestamp: new Date(),
      side
    };
    addMessage(userMessage);
    setLoading(side, true);

    try {
      // Send chat request to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          conversationHistory: messages,
          systemInstructions: SYSTEM_PROMPTS[currentContext.state].instructions
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Handle special case for understanding state completion
      if (currentContext.state === ConversationState.UNDERSTANDING &&
        data.message.includes('Got it!')) {
        const otherSideComplete = completion[side === 'left' ? 'right' : 'left'];
        data.message = otherSideComplete
          ? "Got it! Coming up with a resolution..."
          : "Got it! Waiting for the other person to finish...";
      }

      // Create and add AI response message
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        content: data.message,
        isUser: false,
        timestamp: new Date(),
        side
      };
      addMessage(aiMessage);

      // Set completion state if appropriate
      if (currentContext.state === ConversationState.UNDERSTANDING &&
        data.message.includes('Got it!')) {
        setCompletion(side, true);
      }
    } catch (err) {
      // Handle errors and add error message to conversation
      console.error('Chat Error:', err);
      setError(side, err instanceof Error ? err.message : 'Failed to send message');

      addMessage({
        id: `error-${Date.now()}`,
        content: "Sorry, I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date(),
        side
      });
    } finally {
      setLoading(side, false);
    }
  };

  // Return relevant state and functions for component use
  return {
    messages,
    sendMessage,
    isLoading: currentLoading,
    error: currentError,
    currentState: currentContext.state,
    isComplete
  };
}