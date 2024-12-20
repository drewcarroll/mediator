export interface ChatMessage {
    id: string;
    content: string;
    isUser: boolean;
    timestamp: Date;
}

export type ArgumentType =
    | 'UNCLASSIFIED';

export type ConversationPhase =
    | 'UNDERSTANDING'
    | 'FORMULA_QUESTIONS'
    | 'RESOLUTION';

export interface PhaseProgress {
    understanding: {
        step: 'INITIAL' | 'GETTING_SIDE' | 'VERIFYING' | 'UNDERSTOOD';
        verifiedContent?: string;
    };
    formulaQuestions?: {
        currentQuestion: number;
        totalQuestions: number;
        answers: Record<string, string>;
    };
    resolution?: {
        recommendations: string[];
        accepted: boolean;
    };
}

// Main state tracker
export interface ConversationState {
    currentPhase: ConversationPhase;
    progress: PhaseProgress;
}