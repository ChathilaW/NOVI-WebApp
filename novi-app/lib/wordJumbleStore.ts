import { WordEntry } from '@/constants/wordBank';

export interface WordJumbleState {
    words: WordEntry[];
    wordIdx: number;
    score: number;
    streak: number;
    solved: number;
    currentEntry: WordEntry | null;
    scrambled: string[];
    selected: number[];
    timeLeft: number;
    showClue: boolean;
    hintUsed: boolean;
    feedback: 'correct' | 'wrong' | null;
}

export let globalWordJumbleState: WordJumbleState | null = null;

export const saveWordJumbleState = (state: WordJumbleState) => {
    globalWordJumbleState = state;
};

export const getWordJumbleState = () => {
    return globalWordJumbleState;
};

export const clearWordJumbleState = () => {
    globalWordJumbleState = null;
};
