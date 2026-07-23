export type GameScreen = "intro" | "round" | "result";

export type RoundCategory = "instinct" | "kopitiam" | "slang";

export type TileStatus = "correct" | "present" | "absent";

/** A clue rendered as plain text with an optional emphasised (bold) span. */
export interface ClueSegment {
  text: string;
  emphasis?: boolean;
}

export interface WordEntry {
  /** Uppercase, no spaces. */
  word: string;
  /** Safe clue segments — replaces raw HTML `<b>` emphasis from the prototype. */
  clue: ClueSegment[];
}

export interface RoundConfig {
  key: RoundCategory;
  label: string;
}

export interface GuessRecord {
  guess: string;
  statuses: TileStatus[];
}

export interface RoundResult {
  word: string;
  category: string;
  guesses: GuessRecord[];
  solved: boolean;
  /** Guesses used; equals 6 if unsolved. */
  attempts: number;
}

export interface WordleState {
  // UI state
  screen: GameScreen;
  /** 0..2 */
  roundIndex: number;
  currentGuess: string;
  guessCount: number;
  hintUsed: boolean;
  /** guessCount >= HINT_UNLOCK_AT */
  hintUnlocked: boolean;
  /** true while a submitted guess is animating */
  locked: boolean;
  keyStatus: Record<string, TileStatus>;
  feedback: string;
  feedbackTone: "neutral" | "win" | "lose";
  shakeToken: number;

  // Game state
  currentWord: WordEntry | null;
  guesses: GuessRecord[];
  roundResults: RoundResult[];
  score: number;
  justSolvedPoints: number | null;

  // Persistence state
  bestScore: number;
  justHitNewBest: boolean;
}

export interface WordleLeaderboardEntry {
  id: number;
  playerName: string;
  score: number;
  /** 0-3 */
  wordsSolved: number;
  /** 3 */
  totalWords: number;
  /** ISO date string */
  createdAt: string;
}
