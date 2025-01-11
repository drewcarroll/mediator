import { create } from 'zustand';
import { ChatMessage, ConversationState, ConversationContext, SYSTEM_PROMPTS } from '@/types/chat';

interface ConversationStore {
  messages: ChatMessage[];
  contexts: Record<'left' | 'right', ConversationContext>;
  isLoading: Record<'left' | 'right', boolean>;
  error: Record<'left' | 'right', string | null>;

  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateContext: (side: 'left' | 'right', newContext: Partial<ConversationContext>) => void;
  setLoading: (side: 'left' | 'right', loading: boolean) => void;
  setError: (side: 'left' | 'right', error: string | null) => void;
  transitionToNextState: (side: 'left' | 'right') => void;
  resetConversation: (side: 'left' | 'right') => void;
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

  transitionToNextState: (side) => {
    const { contexts, messages } = get();
    const currentContext = contexts[side];

    const transitions: Partial<Record<ConversationState, ConversationState>> = {
      [ConversationState.UNDERSTANDING]: ConversationState.CLASSIFICATION,
    };

    const nextState = transitions[currentContext.state];
    if (!nextState) return;

    const systemPrompt = SYSTEM_PROMPTS[nextState];
    const sideMessages = messages.filter(msg => msg.side === side);

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
    }
  })),
}));