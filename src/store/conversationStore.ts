import { create } from 'zustand';
import { ChatMessage, ConversationState, ConversationContext, SYSTEM_PROMPTS } from '@/types/chat';

type ChatSide = 'left' | 'right';

interface ConversationStore {
  messages: ChatMessage[];
  contexts: Record<ChatSide, ConversationContext>;
  isLoading: Record<ChatSide, boolean>;
  error: Record<ChatSide, string | null>;
  completion: Record<ChatSide, boolean>;

  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateContext: (side: ChatSide, newContext: Partial<ConversationContext>) => void;
  setLoading: (side: ChatSide, loading: boolean) => void;
  setError: (side: ChatSide, error: string | null) => void;
  setCompletion: (side: ChatSide, isComplete: boolean) => void;
  checkAndTransition: () => void;
  resetConversation: (side: ChatSide) => void;
}

const INITIAL_STATE: ConversationContext = {
  state: ConversationState.UNDERSTANDING,
};

export const useConversationStore = create<ConversationStore>((set, get) => ({
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

  setMessages: (messages) => set({ messages }),

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),

  updateContext: (side, newContext) => set((state) => ({
    contexts: {
      ...state.contexts,
      [side]: { ...state.contexts[side], ...newContext }
    }
  })),

  setLoading: (side, loading) => set((state) => ({
    isLoading: {
      ...state.isLoading,
      [side]: loading
    }
  })),

  setError: (side, error) => set((state) => ({
    error: {
      ...state.error,
      [side]: error
    }
  })),

  setCompletion: (side, isComplete) => {
    set((state) => ({
      completion: {
        ...state.completion,
        [side]: isComplete
      }
    }));
    // Check if both sides are complete after updating
    get().checkAndTransition();
  },

  checkAndTransition: () => {
    const state = get();
    const bothComplete = state.completion.left && state.completion.right;

    if (bothComplete) {
      // Reset completion status
      set((state) => ({
        completion: {
          left: false,
          right: false
        }
      }));

      // Transition both sides
      (['left', 'right'] as const).forEach((side) => {
        const currentContext = state.contexts[side];
        const transitions: Partial<Record<ConversationState, ConversationState>> = {
          [ConversationState.UNDERSTANDING]: ConversationState.CLASSIFICATION,
        };

        const nextState = transitions[currentContext.state];
        if (!nextState) return;

        const systemPrompt = SYSTEM_PROMPTS[nextState];
        const sideMessages = state.messages.filter(msg => msg.side === side);

        const transformedMessages = systemPrompt.messageTransformer
          ? systemPrompt.messageTransformer(sideMessages)
          : sideMessages;

        set((state) => ({
          contexts: {
            ...state.contexts,
            [side]: { ...state.contexts[side], state: nextState }
          },
          messages: [
            ...state.messages.filter(msg => msg.side !== side),
            ...transformedMessages
          ]
        }));
      });
    }
  },

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
}));