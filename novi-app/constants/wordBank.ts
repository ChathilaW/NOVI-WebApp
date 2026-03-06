export interface WordEntry {
    word: string;
    clue: string;
}

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

export default WORD_BANK;