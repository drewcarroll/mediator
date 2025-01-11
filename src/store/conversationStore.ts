// Import Zustand store creator and chat-related types
import { create } from 'zustand';
import { ChatMessage, ConversationState, ConversationContext, SYSTEM_PROMPTS } from '@/types/chat';

// Define possible chat sides
type ChatSide = 'left' | 'right';

// Define the store's state and actions interface
interface ConversationStore {
  // State properties
  messages: ChatMessage[];
  contexts: Record<ChatSide, ConversationContext>;
  isLoading: Record<ChatSide, boolean>;
  error: Record<ChatSide, string | null>;
  completion: Record<ChatSide, boolean>;

  // Action methods
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateContext: (side: ChatSide, newContext: Partial<ConversationContext>) => void;
  setLoading: (side: ChatSide, loading: boolean) => void;
  setError: (side: ChatSide, error: string | null) => void;
  setCompletion: (side: ChatSide, isComplete: boolean) => void;
  checkAndTransition: () => void;
  resetConversation: (side: ChatSide) => void;
}

// Initial context state for both sides
const INITIAL_STATE: ConversationContext = {
  state: ConversationState.UNDERSTANDING,
};

// Create and export the Zustand store
export const useConversationStore = create<ConversationStore>((set, get) => ({
  // Initial state values
  messages: [],
  contexts: {
    left: INITIAL_STATE,
    right: INITIAL_STATE
  },
  isLoading: {
    left: false,
    right: false
  },
  error: {
    left: null,
    right: null
  },
  completion: {
    left: false,
    right: false
  },

  // Action to replace all messages
  setMessages: (messages) => set({ messages }),

  // Action to add a single message to the list
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),

  // Action to update context for a specific side
  updateContext: (side, newContext) => set((state) => ({
    contexts: {
      ...state.contexts,
      [side]: { ...state.contexts[side], ...newContext }
    }
  })),

  // Action to set loading state for a side
  setLoading: (side, loading) => set((state) => ({
    isLoading: {
      ...state.isLoading,
      [side]: loading
    }
  })),

  // Action to set error state for a side
  setError: (side, error) => set((state) => ({
    error: {
      ...state.error,
      [side]: error
    }
  })),

  // Action to set completion state and check for transition
  setCompletion: (side, isComplete) => {
    set((state) => ({
      completion: {
        ...state.completion,
        [side]: isComplete
      }
    }));
    get().checkAndTransition();
  },

  // Action to reset conversation state for a specific side
  resetConversation: (side) => set((state) => ({
    messages: state.messages.filter(msg => msg.side !== side),
    contexts: {
      ...state.contexts,
      [side]: INITIAL_STATE
    },
    error: {
      ...state.error,
      [side]: null
    },
    completion: {
      ...state.completion,
      [side]: false
    }
  })),

  // Complex action to handle transition when both sides complete
  checkAndTransition: async () => {
    const state = get();
    const bothComplete = state.completion.left && state.completion.right;

    if (bothComplete) {
      // Extract final AI statements from both sides
      const leftStatement = state.messages
        .filter(msg => msg.side === 'left' && !msg.isUser)
        .slice(-2)[0]?.content;
      const rightStatement = state.messages
        .filter(msg => msg.side === 'right' && !msg.isUser)
        .slice(-2)[0]?.content;

      // Helper function to get resolution advice from API
      const getResolution = async (statement: string) => {
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: statement,
              systemInstructions: `Based on this person's perspective of the conflict: "${statement}", provide a single 
              paragraph of specific, actionable advice for what this person can do to help resolve the conflict. Focus
              on what this specific person can do, not what the other person should do. Important: Be VERY SPECIFIC TO 
              THE SCENARIO. Use SPECIFIC DETAILS pertaining to what each side is thinking feeling and how to resolve. 
              Almost use TOO MANY specific details about the scenario. In your resolution to this person, use wording
              that seems to take their side, but say what needs to be done in order to resolve the conflict.`
            }),
          });

          const data = await response.json();
          return data.message;
        } catch (error) {
          console.error('Resolution Error:', error);
          return 'Unable to generate resolution advice at this time.';
        }
      };

      // Get resolutions for both sides concurrently
      const [leftResolution, rightResolution] = await Promise.all([
        getResolution(leftStatement || ''),
        getResolution(rightStatement || '')
      ]);

      // Replace all messages with resolution messages
      set((state) => ({
        messages: [
          {
            id: `resolution-left-${Date.now()}`,
            content: leftResolution,
            isUser: false,
            timestamp: new Date(),
            side: 'left'
          },
          {
            id: `resolution-right-${Date.now()}`,
            content: rightResolution,
            isUser: false,
            timestamp: new Date(),
            side: 'right'
          }
        ],
      }));
    }
  }
}));