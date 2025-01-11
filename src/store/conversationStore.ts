// Stores conversation state
import { create } from 'zustand';
import { ChatMessage, ConversationState, ConversationContext, SYSTEM_PROMPTS } from '@/types/chat';

interface ConversationStore {
  messages: ChatMessage[];
  context: ConversationContext;
  isLoading: boolean;
  error: string | null;

  // Store actions (functions that modify state)
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateContext: (context: Partial<ConversationContext>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  transitionToNextState: () => void;
  resetConversation: () => void;
}

// Define the initial state for the conversation context
const INITIAL_STATE: ConversationContext = {
  state: ConversationState.UNDERSTANDING,
};

// Create and export the store
export const useConversationStore = create<ConversationStore>((set, get) => ({
  messages: [],
  context: INITIAL_STATE,
  isLoading: false,
  error: null,

  // Replace all messages
  setMessages: (messages) => set({ messages }),
  
  // Add new message to existing array
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),

  // Merge new context with existing
  updateContext: (newContext) => set((state) => ({
    context: { ...state.context, ...newContext }
  })),

  // Set loading state
  setLoading: (loading) => set({ isLoading: loading }),
  
  // Set error state
  setError: (error) => set({ error }),

  // Handles state transitions
  transitionToNextState: () => {
    const { context, messages } = get();
    console.log("Moving onto the next stage...");
    
    // Define what state comes after each state
    const transitions: Partial<Record<ConversationState, ConversationState>> = {
      [ConversationState.UNDERSTANDING]: ConversationState.CLASSIFICATION,
    };

    // Get the next state based on current state
    const nextState = transitions[context.state];
    if (!nextState) return;

    // Get system prompt for next state
    const systemPrompt = SYSTEM_PROMPTS[nextState];

    // Transform messages if transformer exists, otherwise keep as is
    const transformedMessages = systemPrompt.messageTransformer 
      ? systemPrompt.messageTransformer(messages)
      : messages;

    // Update both state and messages
    set((state) => ({
      context: { ...state.context, state: nextState },
      messages: transformedMessages,
    }));
  },

  // Reset everything back to initial state
  resetConversation: () => set({
    messages: [],
    context: INITIAL_STATE,
    error: null
  }),
}));