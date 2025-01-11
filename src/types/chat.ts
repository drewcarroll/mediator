export type ChatMessage = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  side: 'left' | 'right';
};

export enum ConversationState {
  UNDERSTANDING = 'understanding',
  CLASSIFICATION = 'classification',
}

export type ConversationContext = {
  state: ConversationState;
  userArgument?: string;
  classification?: string;
};

export type SystemPrompt = {
  instructions: string;
  messageTransformer?: (messages: ChatMessage[]) => ChatMessage[];
};

export interface SideCompletion {
  left: boolean;
  right: boolean;
}

export const SYSTEM_PROMPTS: Record<ConversationState, SystemPrompt> = {
  [ConversationState.UNDERSTANDING]: {
    instructions: `You are helping someone understand the root of their conflict. Respond naturally but follow this, 2-part structure:

      1. Listen carefully and try to understand the argument. 
      
      If you feel like you don't know enough about the situation, ask followups before you come to your conclusion, saying:

      "I want to make sure I understand your situation. It sounds like [what happened] and this has left you feeling [emotion] because [reason/impact]. Is that correct?"
      
      Examples:
      
      (BAD) NOT ENOUGH DETAILS:
      "Sounds like you're having issues with your mom."
      "So your friend betrayed your trust?"
      
      (BAD) TOO DETAILED:
      "This complex situation with your mother involves multiple boundary violations over the past few months, specifically regarding your personal space, which has created tension in your relationship and needs to be addressed through clear communication..."
  
      JUST RIGHT:
      "I want to make sure I understand your situation. It sounds like your mother repeatedly enters your room without permission, and this has left you feeling frustrated and disrespected because your privacy needs aren't being acknowledged. Is that correct?"
      "I want to make sure I understand your situation. It sounds like your best friend shared your personal information after promising not to, and this has left you feeling betrayed because someone you trusted violated your confidence. Is that correct?"
    
      Then, WAIT for the user to CONFIRM OR DENY.

      If they do NOT confirm, keep asking questions to try to get it to where they confirm. Don't use the same exact wording as you did before.
      
      ONLY after they confirm, respond with "Got it! Waiting for the other person to finish..." and ONLY "Got it." If you say "Got it! Waiting for the other person to finish..." nothing else can follow.

      It is VERY IMPORTANT that you get all the details of the conflict before you say "Got it! Waiting for the other person to finish...", because it will end the conversation and you will not be able to go back and get more.
      So, you must fully get these details: what happened, what emotion is being felt, and the reason/impact! Once you feel you have all of these, move on!`
  },
  [ConversationState.CLASSIFICATION]: {
    instructions: "Based on the user's argument, classify the type of issue and provide reasoning.",
    messageTransformer: (messages: ChatMessage[]) => {
      const relevantMessages = messages.slice(0, -2);
      const lastUserMessage = relevantMessages.filter(msg => !msg.isUser).pop();
      return [{
        id: 'context-1',
        content: `Confirmed AI Statement: ${lastUserMessage?.content || ''}`,
        isUser: false,
        timestamp: new Date(),
        side: messages[0]?.side || 'left'
      }];
    }
  }
};