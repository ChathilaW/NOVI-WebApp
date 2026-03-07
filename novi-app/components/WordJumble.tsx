'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X, Lightbulb, HelpCircle, SkipForward, Loader2 } from 'lucide-react';
import { WordEntry, fetchRandomWords, fetchDefinition } from '@/constants/wordBank';
import { getWordJumbleState, saveWordJumbleState } from '@/lib/wordJumbleStore';

const DEF_API = process.env.NEXT_PUBLIC_WORD_DEF_API ?? '';
const WORDS_PER_SESSION = 10; // fetch this many words each time the game opens

/* ------------------------------------------------------------------ */
/*  Helper: shuffle an array (Fisher-Yates)                           */
/* ------------------------------------------------------------------ */
function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/* ------------------------------------------------------------------ */
/*  Props                                                             */
/* ------------------------------------------------------------------ */
interface WordJumbleProps {
    onClose: () => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
const WordJumble = ({ onClose }: WordJumbleProps) => {
    /* — word list for this session — */
    const [words, setWords] = useState<WordEntry[]>([]);
    const wordsRef = useRef<WordEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const wordIdx = useRef(0);

    /* — game-level state — */
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [solved, setSolved] = useState(0);

    /* — round-level state — */
    const [currentEntry, setCurrentEntry] = useState<WordEntry | null>(null);
    const [scrambled, setScrambled] = useState<string[]>([]);
    const [selected, setSelected] = useState<number[]>([]);
    const [timeLeft, setTimeLeft] = useState(30);
    const [showClue, setShowClue] = useState(false);
    const [hintUsed, setHintUsed] = useState(false);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

    /* — derived answer string — */
    const answer = useMemo(
        () => selected.map((i) => scrambled[i]).join(''),
        [selected, scrambled],
    );

    /* ---------------------------------------------------------------- */
    /*  Pick next word from the list                                     */
    /* ---------------------------------------------------------------- */
    const pickWord = useCallback(() => {
        const list = wordsRef.current;
        const idx = wordIdx.current;
        if (idx >= list.length) return; // all words used

        const entry = list[idx];
        wordIdx.current = idx + 1;

        setCurrentEntry(entry);
        setScrambled(shuffle(entry.word.split('')));
        setSelected([]);
        setTimeLeft(30);
        setShowClue(false);
        setHintUsed(false);
        setFeedback(null);
    }, []);

    /* ---------------------------------------------------------------- */
    /*  Bootstrap: fetch random words + definitions in parallel          */
    /* ---------------------------------------------------------------- */
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);

            try {
                const parsed = getWordJumbleState();
                if (parsed) {
                    // finished if on the 10th word and either time is up or correctly solved
                    const isFinished = parsed.wordIdx >= WORDS_PER_SESSION && (parsed.timeLeft <= 0 || parsed.feedback === 'correct');

                    if (!isFinished && parsed.words && parsed.words.length > 0) {
                        setWords(parsed.words);
                        wordsRef.current = parsed.words;
                        wordIdx.current = parsed.wordIdx;
                        setScore(parsed.score ?? 0);
                        setStreak(parsed.streak ?? 0);
                        setSolved(parsed.solved ?? 0);
                        setCurrentEntry(parsed.currentEntry ?? null);
                        setScrambled(parsed.scrambled ?? []);
                        setSelected(parsed.selected ?? []);
                        setTimeLeft(parsed.timeLeft ?? 30);
                        setShowClue(parsed.showClue ?? false);
                        setHintUsed(parsed.hintUsed ?? false);
                        setFeedback(parsed.feedback ?? null);
                        setIsLoading(false);
                        return;
                    } else if (isFinished) {
                        setScore(parsed.score ?? 0);
                        setStreak(parsed.streak ?? 0);
                        setSolved(parsed.solved ?? 0);
                    }
                }
            } catch (err) {
                console.error('Failed to parse word jumble state', err);
            }

            // 1) Fetch a large pool of random words from local dictionary
            const rawWords = await fetchRandomWords(100);
            if (cancelled) return;

            // If the static fallback bank was returned (words already have clues)
            if (rawWords.length > 0 && rawWords[0].clue !== '') {
                const session = rawWords.slice(0, WORDS_PER_SESSION);
                setWords(session);
                wordsRef.current = session;
                setIsLoading(false);
                return;
            }

            // 2) Fetch definitions in batches of 10
            const ready: WordEntry[] = [];
            const BATCH_SIZE = 10;
            
            for (let i = 0; i < rawWords.length; i += BATCH_SIZE) {
                if (ready.length >= WORDS_PER_SESSION) break;
                if (cancelled) return;

                const batch = rawWords.slice(i, i + BATCH_SIZE);
                const results = await Promise.allSettled(
                    batch.map((entry) => fetchDefinition(entry.word, DEF_API)),
                );
                
                results.forEach((r, idx) => {
                    if (ready.length >= WORDS_PER_SESSION) return;
                    if (r.status === 'fulfilled' && r.value) {
                        ready.push({ word: batch[idx].word, clue: r.value });
                    }
                });
            }

            // Fallback if we couldn't get enough valid definitions
            if (ready.length < WORDS_PER_SESSION) {
                const needed = WORDS_PER_SESSION - ready.length;
                const remainingRaw = rawWords.filter(w => !ready.find(r => r.word === w.word));
                for (let i = 0; i < needed && i < remainingRaw.length; i++) {
                    ready.push({ word: remainingRaw[i].word, clue: 'Dictionary definition unavailable.' });
                }
            }

            setWords(ready);
            wordsRef.current = ready;
            setIsLoading(false);
        })();
        return () => { cancelled = true; };
    }, []);

    /* pick the first word once words are loaded */
    useEffect(() => {
        if (words.length > 0 && !currentEntry) {
            pickWord();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [words]);

    /* Save State */
    useEffect(() => {
        if (!isLoading && words.length > 0) {
            const stateToSave = {
                words,
                wordIdx: wordIdx.current,
                score,
                streak,
                solved,
                currentEntry,
                scrambled,
                selected,
                timeLeft,
                showClue,
                hintUsed,
                feedback,
            };
            saveWordJumbleState(stateToSave);
        }
    }, [
        words,
        score,
        streak,
        solved,
        currentEntry,
        scrambled,
        selected,
        timeLeft,
        showClue,
        hintUsed,
        feedback,
        isLoading,
    ]);

    /* ---------------------------------------------------------------- */
    /*  Timer                                                            */
    /* ---------------------------------------------------------------- */
    useEffect(() => {
        if (!currentEntry) return;
        if (timeLeft <= 0) {
            // time up → skip
            if (feedback !== 'correct') {
                setStreak(0);
            }
            pickWord();
            return;
        }
        const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
        return () => clearInterval(id);
    }, [timeLeft, currentEntry, pickWord, feedback]);

    /* ---------------------------------------------------------------- */
    /*  Auto-check answer                                                */
    /* ---------------------------------------------------------------- */
    useEffect(() => {
        if (!currentEntry) return;
        if (answer.length !== currentEntry.word.length) return;

        if (answer === currentEntry.word) {
            setFeedback('correct');
            const points = hintUsed ? 3 : 5;
            setScore((s) => s + points);
            setStreak((s) => s + 1);
            setSolved((s) => s + 1);
            setTimeout(() => pickWord(), 900);
        } else {
            setFeedback('wrong');
            setStreak(0);
            setTimeout(() => {
                setSelected([]);
                setFeedback(null);
            }, 700);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [answer]);

    /* ---------------------------------------------------------------- */
    /*  Actions                                                          */
    /* ---------------------------------------------------------------- */
    const handleLetterClick = (idx: number) => {
        if (selected.includes(idx) || feedback) return;
        setSelected((prev) => [...prev, idx]);
    };

    const handleAnswerLetterClick = (pos: number) => {
        if (feedback) return;
        setSelected((prev) => prev.filter((_, i) => i !== pos));
    };

    const handleHint = () => {
        if (!currentEntry || hintUsed || feedback) return;
        setHintUsed(true);
        // reveal the first un-placed correct letter
        const word = currentEntry.word;
        for (let i = answer.length; i < word.length; i++) {
            const letter = word[i];
            const scrambledIdx = scrambled.findIndex(
                (l, idx) => l === letter && !selected.includes(idx),
            );
            if (scrambledIdx !== -1) {
                setSelected((prev) => [...prev, scrambledIdx]);
                break;
            }
        }
    };

    const handleSkip = () => {
        setStreak(0);
        pickWord();
    };

    /* ---------------------------------------------------------------- */
    /*  Format timer                                                     */
    /* ---------------------------------------------------------------- */
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const timerStr = `${mins}:${secs.toString().padStart(2, '0')}`;

    /* ---------------------------------------------------------------- */
    /*  Render                                                           */
    /* ---------------------------------------------------------------- */
    if (isLoading || !currentEntry) {
        return (
            <div className="fixed top-4 right-4 z-50 w-[300px] rounded-2xl bg-[#1a1e25] shadow-2xl border border-gray-700/50 flex flex-col items-center justify-center font-sans text-white p-10 gap-3">
                <Loader2 size={28} className="animate-spin text-[#5162F6]" />
                <span className="text-sm text-gray-400">Loading words…</span>
            </div>
        );
    }

    return (
        <div className="fixed top-4 right-4 z-50 w-[300px] rounded-2xl bg-[#1a1e25] shadow-2xl border border-gray-700/50 flex flex-col font-sans text-white overflow-hidden select-none">
            {/* --- Header --- */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/40">
                <span className="font-bold text-base flex items-center gap-2">
                    🧩 Mini Game
                </span>
                <button
                    onClick={onClose}
                    className="hover:bg-gray-700 rounded-full p-1 transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            {/* --- Stats bar --- */}
            <div className="grid grid-cols-3 gap-2 px-4 pt-3 pb-2">
                {[
                    { label: 'SCORE', value: score },
                    { label: 'STREAK', value: streak, color: 'text-red-400' },
                    { label: 'TIME', value: timerStr },
                ].map((s) => (
                    <div
                        key={s.label}
                        className="bg-[#252a33] rounded-xl text-center py-2"
                    >
                        <div className="text-[10px] tracking-widest text-gray-400">
                            {s.label}
                        </div>
                        <div className={`text-xl font-bold ${s.color ?? ''}`}>
                            {s.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* --- Answer slots --- */}
            <div className="px-4 pt-2">
                <p className="text-[10px] tracking-widest text-gray-400 text-center mb-1">
                    YOUR ANSWER
                </p>
                <div
                    className={`min-h-[42px] rounded-xl border-2 flex items-center justify-center gap-1 flex-wrap px-3 py-2 transition-colors ${feedback === 'correct'
                            ? 'border-green-500 bg-green-500/10'
                            : feedback === 'wrong'
                                ? 'border-red-500 bg-red-500/10'
                                : 'border-gray-600 bg-[#252a33]'
                        }`}
                >
                    {answer.length === 0 && (
                        <span className="text-gray-500 text-xs">Tap letters below</span>
                    )}
                    {selected.map((sIdx, pos) => (
                        <button
                            key={pos}
                            onClick={() => handleAnswerLetterClick(pos)}
                            className="w-8 h-8 rounded-lg bg-[#3a4150] flex items-center justify-center text-sm font-bold hover:bg-red-500/40 transition-colors"
                        >
                            {scrambled[sIdx]}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- Scrambled letters --- */}
            <div className="px-4 pt-3">
                <p className="text-[10px] tracking-widest text-gray-400 text-center mb-2">
                    SCRAMBLED LETTERS
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                    {scrambled.map((letter, idx) => {
                        const used = selected.includes(idx);
                        return (
                            <button
                                key={idx}
                                disabled={used}
                                onClick={() => handleLetterClick(idx)}
                                className={`w-9 h-9 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${used
                                        ? 'opacity-20 cursor-default bg-[#252a33]'
                                        : 'bg-[#3a4150] hover:bg-[#5162F6] hover:scale-110 cursor-pointer'
                                    }`}
                            >
                                {letter}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* --- Clue text --- */}
            {showClue && (
                <div className="mx-4 mt-3 rounded-lg bg-[#252a33] p-2 text-xs text-gray-300 text-center animate-pulse">
                    💡 {currentEntry.clue}
                </div>
            )}

            {/* --- Action buttons --- */}
            <div className="flex justify-center gap-3 px-4 py-4">
                <button
                    onClick={handleHint}
                    disabled={hintUsed}
                    className={`flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${hintUsed
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-[#5162F6] hover:bg-[#6574ff] text-white'
                        }`}
                >
                    <Lightbulb size={14} /> Hint
                </button>
                <button
                    onClick={() => setShowClue(true)}
                    className="flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold bg-[#3a4150] hover:bg-[#4c5565] text-white transition-colors"
                >
                    <HelpCircle size={14} /> Clue
                </button>
                <button
                    onClick={handleSkip}
                    className="flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold bg-[#3a4150] hover:bg-[#4c5565] text-white transition-colors"
                >
                    <SkipForward size={14} /> Skip
                </button>
            </div>

            {/* --- Bottom stats --- */}
            <div className="grid grid-cols-3 border-t border-gray-700/40 text-center py-3 text-xs">
                <div>
                    <div className="text-gray-400 text-[10px] tracking-widest">
                        SOLVED
                    </div>
                    <div className="font-bold text-base">{solved}</div>
                </div>
                <div>
                    <div className="text-gray-400 text-[10px] tracking-widest">
                        SCORE
                    </div>
                    <div className="font-bold text-base">{score}</div>
                </div>
                <div>
                    <div className="text-gray-400 text-[10px] tracking-widest">
                        STREAK
                    </div>
                    <div className="font-bold text-base flex items-center justify-center gap-1">
                        {streak} {streak > 0 && '🔥'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WordJumble;