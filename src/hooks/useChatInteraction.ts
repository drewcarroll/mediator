import { useEffect } from 'react';
import { useConversationStore } from '@/store/conversationStore';
import { SYSTEM_PROMPTS, ConversationState, ChatMessage } from '@/types/chat';

export function useChatInteraction(side: 'left' | 'right') {
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

  const messages = allMessages.filter(msg => msg.side === side);
  const currentContext = contexts[side];
  const currentLoading = isLoading[side];
  const currentError = error[side];

  useEffect(() => {
    if (messages.length === 0) {
      addMessage({
        id: `ai-${Date.now()}`,
        content: "What's seems to be the issue?",
        isUser: false,
        timestamp: new Date(),
        side
      });
    }
  }, [messages.length, addMessage, side]);

  const sendMessage = async (prompt: string) => {
    setError(side, null);
    if (!prompt.trim()) {
      setError(side, "Message cannot be empty");
      return;
    }

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

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        content: data.message,
        isUser: false,
        timestamp: new Date(),
        side
      };

      addMessage(aiMessage);

      if (currentContext.state === ConversationState.UNDERSTANDING && data.message.includes('Got it.')) {
        setCompletion(side, true);
      }

    } catch (err) {
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

  return {
    messages,
    sendMessage,
    isLoading: currentLoading,
    error: currentError,
    currentState: currentContext.state,
    isComplete: completion[side],
    otherSideComplete: completion[side === 'left' ? 'right' : 'left']
  };
}