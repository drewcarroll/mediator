import { useState } from 'react';
import { ConversationState, ConversationPhase, PhaseProgress } from '@/types/chat';

const initialState: ConversationState = { // COMMENT AND UNDERSTAND THIS FILELEEEE FERDAAAAA
    currentPhase: 'UNDERSTANDING',
    progress: {
        understanding: {
            step: 'INITIAL'
        }
    }
};

export function useConversationState() {
    const [state, setState] = useState<ConversationState>(initialState);

    const moveToNextStep = (currentResponse: string) => {
        if (state.currentPhase === 'UNDERSTANDING') {
            const currentStep = state.progress.understanding.step;
            switch (currentStep) {
                case 'INITIAL':
                    setState(prev => ({
                        ...prev,
                        progress: {
                            ...prev.progress,
                            understanding: {
                                ...prev.progress.understanding,
                                step: 'GETTING_SIDE'
                            }
                        }
                    }));
                    break;
                case 'GETTING_SIDE':
                    setState(prev => ({
                        ...prev,
                        progress: {
                            ...prev.progress,
                            understanding: {
                                ...prev.progress.understanding,
                                step: 'VERIFYING',
                                verifiedContent: currentResponse
                            }
                        }
                    }));
                    break;
                case 'VERIFYING':
                    if (isAffirmativeResponse(currentResponse)) {
                        setState(prev => ({
                            ...prev,
                            progress: {
                                ...prev.progress,
                                understanding: {
                                    ...prev.progress.understanding,
                                    step: 'UNDERSTOOD'
                                }
                            }
                        }));
                        console.log('Understanding verified:', state.progress.understanding.verifiedContent);
                    }
                    break;
            }
        }
    };

    const isAffirmativeResponse = (response: string): boolean => { // Probably convert this into a prompt, "Does this message imply Yes to the quesiton, or is there more to the story?"
        const affirmativeWords = [
            'yes', 'yeah', 'yep', 'yup', 'ya',
            'correct', 'right', 'exactly', 'precisely',
            'indeed', 'absolutely', 'definitely', 'certainly',
            'sure', 'naturally', 'undoubtedly', 'indubitably',
            'uh-huh', 'mhm', 'yessir', 'yessiree',
            'you bet', 'you betcha', 'righto', 'roger',
            'aye', 'totally', 'totes', 'fo sho',
            'absolutely', 'positively', 'unquestionably',
            'without doubt', 'beyond doubt', 'for sure',
            'most certainly', 'by all means', 'affirmative',
            'oui', 'si', 'ja', 'hai', 'da',
            'of course', 'you know it', 'absolutely yes',
            'sure thing', 'obviously', 'naturally',
            'definitely yes', 'without a doubt',
            'acknowledged', 'confirmed', 'verified',
            'affirmed', 'approved', 'granted',
            'concurred', 'assented', 'agreed'
        ];
        return affirmativeWords.some(word => response.toLowerCase().includes(word));
    };

    return {
        state,
        setState,
        moveToNextStep
    };
}