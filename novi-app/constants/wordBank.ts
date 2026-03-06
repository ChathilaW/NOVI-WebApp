export interface WordEntry {
    word: string;
    clue: string;
}

/* ------------------------------------------------------------------ */
/*  Static fallback word bank (used when API is unreachable)          */
/* ------------------------------------------------------------------ */
const WORD_BANK: WordEntry[] = [
    { word: "VARIABLE", clue: "A container that stores data in programming" },
    { word: "FUNCTION", clue: "A reusable block of code that performs a task" },
    { word: "BOOLEAN", clue: "A data type with only true or false values" },
    { word: "ARRAY", clue: "An ordered collection of elements" },
    { word: "STRING", clue: "A sequence of characters in programming" },
    { word: "OBJECT", clue: "A collection of key-value pairs" },
    { word: "SYNTAX", clue: "The set of rules for writing code correctly" },
    { word: "LOOP", clue: "Repeats a block of code multiple times" },
    { word: "CLASS", clue: "A blueprint for creating objects" },
    { word: "MODULE", clue: "A self-contained unit of code" },
    { word: "SERVER", clue: "A computer that provides services to other computers" },
    { word: "CLIENT", clue: "The program or device that requests data from a server" },
    { word: "DATABASE", clue: "An organized collection of structured data" },
    { word: "NETWORK", clue: "A group of connected computers sharing resources" },
    { word: "COMPILE", clue: "Convert source code into machine code" },
    { word: "DEPLOY", clue: "Release software for use in production" },
    { word: "RENDER", clue: "Generate visual output from code or data" },
    { word: "BINARY", clue: "A number system using only 0 and 1" },
    { word: "PIXEL", clue: "The smallest unit of a digital image" },
    { word: "ROUTER", clue: "Directs data packets between networks" },
    { word: "KERNEL", clue: "The core part of an operating system" },
    { word: "CACHE", clue: "Temporary storage for fast data access" },
    { word: "THREAD", clue: "The smallest unit of processing in a program" },
    { word: "QUEUE", clue: "A data structure that follows first-in, first-out" },
    { word: "STACK", clue: "A data structure that follows last-in, first-out" },
    { word: "TOKEN", clue: "A small piece of data used for authentication" },
    { word: "BRANCH", clue: "A separate line of development in version control" },
    { word: "MERGE", clue: "Combine two branches of code together" },
    { word: "DEBUG", clue: "Find and fix errors in code" },
    { word: "STREAM", clue: "A continuous flow of data" },
];

/* ------------------------------------------------------------------ */
/*  Fetch random words from the API                                   */
/* ------------------------------------------------------------------ */
/**
 * Fetches `count` random words from the NEXT_PUBLIC_RANDOM_WORD_API.
 * - Over-fetches to compensate for filtering (4–10 letter words only).
 * - Uppercases each word and generates an auto-clue.
 * - Falls back to the static WORD_BANK on any error.
 */
export async function fetchRandomWords(count: number = 100): Promise<WordEntry[]> {
    const apiUrl = process.env.NEXT_PUBLIC_RANDOM_WORD_API;

    if (!apiUrl) {
        console.warn('NEXT_PUBLIC_RANDOM_WORD_API not set — using static word bank.');
        return WORD_BANK;
    }

    try {
        // Over-fetch to have enough words after length filtering
        const response = await fetch(`${apiUrl}?number=${count * 2}`);

        if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
        }

        const rawWords: string[] = await response.json();

        // Filter to words with 4–10 letters (keeps the game playable)
        const filtered = rawWords
            .filter((w) => w.length >= 4 && w.length <= 10)
            .slice(0, count);

        if (filtered.length === 0) {
            throw new Error('No words passed the length filter');
        }

        // Convert to WordEntry with auto-generated clues
        return filtered.map((w) => {
            const upper = w.toUpperCase();
            return {
                word: upper,
                clue: `${upper.length} letters, starts with "${upper[0]}"`,
            };
        });
    } catch (err) {
        console.error('Failed to fetch random words, falling back to static bank:', err);
        return WORD_BANK;
    }
}

export default WORD_BANK;