"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { pickWord, ROUND_ORDER } from "~/app/_data/wordBank";
import type {
  GuessRecord,
  RoundResult,
  TileStatus,
  WordleState,
} from "~/app/_lib/types";

export const MAX_GUESSES = 6;
export const HINT_UNLOCK_AT = 2;
export const HINT_PENALTY = 150;
export const TOTAL_ROUNDS = ROUND_ORDER.length;

const SCORE_TABLE = [700, 600, 500, 400, 300, 200];
const TILE_FLIP_MS = 220;
const REVEAL_TAIL_MS = 250;
const ROUND_ADVANCE_MS = 1600;
const BEST_SCORE_STORAGE_KEY = "sg61-wordle-best-score";

const STATUS_PRIORITY: Record<TileStatus, number> = {
  absent: 0,
  present: 1,
  correct: 2,
};

/**
 * Evaluates a guess against the answer using a two-pass algorithm (exact
 * matches first, then remaining-letter counts for "present"), correctly
 * handling repeated letters. Ported from the reference prototype's
 * `evaluateGuess`.
 */
export function evaluateGuess(guess: string, answer: string): TileStatus[] {
  const result: TileStatus[] = Array<TileStatus>(answer.length).fill("absent");
  const counts: Record<string, number> = {};
  for (const ch of answer) counts[ch] = (counts[ch] ?? 0) + 1;

  for (let i = 0; i < answer.length; i++) {
    if (guess[i] && guess[i] === answer[i]) {
      result[i] = "correct";
      const ch = answer[i]!;
      counts[ch] = (counts[ch] ?? 0) - 1;
    }
  }
  for (let i = 0; i < answer.length; i++) {
    if (result[i] === "correct") continue;
    const ch = guess[i];
    if (ch && (counts[ch] ?? 0) > 0) {
      result[i] = "present";
      counts[ch] = (counts[ch] ?? 0) - 1;
    }
  }
  return result;
}

/** Guess-count-based scoring table, matching the reference prototype. */
export function scoreForGuess(guessNumber: number, hintUsed: boolean): number {
  const base = SCORE_TABLE[guessNumber - 1] ?? 100;
  if (!hintUsed) return base;
  return Math.max(50, base - HINT_PENALTY);
}

/** Key colours only ever upgrade (absent -> present -> correct), never downgrade. */
export function upgradeKeyStatus(
  prev: TileStatus | undefined,
  next: TileStatus,
): TileStatus {
  if (!prev) return next;
  return STATUS_PRIORITY[next] > STATUS_PRIORITY[prev] ? next : prev;
}

function readBestScore(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(BEST_SCORE_STORAGE_KEY);
  const parsed = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

function writeBestScore(score: number): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BEST_SCORE_STORAGE_KEY, String(score));
}

function initialState(): WordleState {
  return {
    screen: "intro",
    roundIndex: 0,
    currentGuess: "",
    guessCount: 0,
    hintUsed: false,
    hintUnlocked: false,
    locked: false,
    keyStatus: {},
    feedback: "",
    feedbackTone: "neutral",
    shakeToken: 0,
    currentWord: null,
    guesses: [],
    roundResults: [],
    score: 0,
    justSolvedPoints: null,
    bestScore: 0,
    justHitNewBest: false,
  };
}

export function useWordleEngine() {
  const [state, setState] = useState<WordleState>(initialState);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    setState((s) => ({ ...s, bestScore: readBestScore() }));
  }, []);

  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const schedule = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  const startRound = useCallback((roundIndex: number) => {
    const cat = ROUND_ORDER[roundIndex];
    if (!cat) return;
    const wordEntry = pickWord(cat.key);
    setState((s) => ({
      ...s,
      screen: "round",
      roundIndex,
      currentWord: wordEntry,
      currentGuess: "",
      guesses: [],
      guessCount: 0,
      hintUsed: false,
      hintUnlocked: false,
      locked: false,
      keyStatus: {},
      feedback: "Type your first guess.",
      feedbackTone: "neutral",
      justSolvedPoints: null,
    }));
  }, []);

  const startGame = useCallback(() => {
    setState((s) => ({
      ...s,
      score: 0,
      roundResults: [],
      justHitNewBest: false,
    }));
    startRound(0);
  }, [startRound]);

  const typeLetter = useCallback((letter: string) => {
    setState((s) => {
      if (s.screen !== "round" || s.locked || !s.currentWord) return s;
      if (!/^[A-Z]$/.test(letter)) return s;
      if (s.currentGuess.length >= s.currentWord.word.length) return s;
      return { ...s, currentGuess: s.currentGuess + letter };
    });
  }, []);

  const backspace = useCallback(() => {
    setState((s) => {
      if (s.screen !== "round" || s.locked) return s;
      return { ...s, currentGuess: s.currentGuess.slice(0, -1) };
    });
  }, []);

  useEffect(() => {
    if (state.justHitNewBest) writeBestScore(state.bestScore);
  }, [state.justHitNewBest, state.bestScore]);

  const finishRound = useCallback(
    (result: RoundResult, roundIndex: number) => {
      schedule(() => {
        if (roundIndex < TOTAL_ROUNDS - 1) {
          setState((s) => ({
            ...s,
            roundResults: [...s.roundResults, result],
          }));
          startRound(roundIndex + 1);
        } else {
          setState((s) => {
            const roundResults = [...s.roundResults, result];
            const justHitNewBest = s.score > s.bestScore;
            const bestScore = justHitNewBest ? s.score : s.bestScore;
            return {
              ...s,
              screen: "result",
              roundResults,
              bestScore,
              justHitNewBest,
            };
          });
        }
      }, ROUND_ADVANCE_MS);
    },
    [schedule, startRound],
  );

  // NOTE: side effects (scheduling timers, calling finishRound) must never
  // run inside a setState updater function — React (in development, under
  // Strict Mode) invokes updater functions twice to detect impure updates,
  // which would double- or quadruple-fire those side effects. This callback
  // instead reads `state` directly (it depends on `state`, so it is
  // recreated each render with a fresh snapshot) and performs every side
  // effect from its own plain function body.
  const submitGuess = useCallback(() => {
    if (state.screen !== "round" || state.locked || !state.currentWord) {
      return;
    }
    const word = state.currentWord.word;

    if (state.currentGuess.length < word.length) {
      setState((s) => ({
        ...s,
        feedback: "Not enough letters",
        feedbackTone: "neutral",
        shakeToken: s.shakeToken + 1,
      }));
      return;
    }

    const guess = state.currentGuess;
    const statuses = evaluateGuess(guess, word);
    const guessRecord: GuessRecord = { guess, statuses };
    const guessCount = state.guessCount + 1;
    const priorGuesses = state.guesses;
    const roundIndex = state.roundIndex;
    const hintUsed = state.hintUsed;
    let keyStatus = state.keyStatus;
    guess.split("").forEach((ch, i) => {
      const next = upgradeKeyStatus(keyStatus[ch], statuses[i]!);
      if (next !== keyStatus[ch]) keyStatus = { ...keyStatus, [ch]: next };
    });

    setState((s) => ({
      ...s,
      currentGuess: "",
      locked: true,
      guesses: [...s.guesses, guessRecord],
      guessCount,
      keyStatus,
    }));

    const revealDelay = word.length * TILE_FLIP_MS + REVEAL_TAIL_MS;

    schedule(() => {
      const solved = guess === word;
      if (solved) {
        const points = scoreForGuess(guessCount, hintUsed);
        const result: RoundResult = {
          word,
          category: ROUND_ORDER[roundIndex]?.label ?? "",
          guesses: [...priorGuesses, guessRecord],
          solved: true,
          attempts: guessCount,
        };
        setState((s) => ({
          ...s,
          score: s.score + points,
          justSolvedPoints: points,
          feedback: hintUsed
            ? `Correct! +${points} pts (hint penalty applied)`
            : `Correct! +${points} pts`,
          feedbackTone: "win",
        }));
        finishRound(result, roundIndex);
      } else if (guessCount >= MAX_GUESSES) {
        const result: RoundResult = {
          word,
          category: ROUND_ORDER[roundIndex]?.label ?? "",
          guesses: [...priorGuesses, guessRecord],
          solved: false,
          attempts: MAX_GUESSES,
        };
        setState((s) => ({
          ...s,
          feedback: `Out of guesses — it was ${word}`,
          feedbackTone: "lose",
        }));
        finishRound(result, roundIndex);
      } else {
        setState((s) => ({
          ...s,
          locked: false,
          feedback: "Keep going.",
          feedbackTone: "neutral",
          hintUnlocked: guessCount >= HINT_UNLOCK_AT && !s.hintUsed,
        }));
      }
    }, revealDelay);
  }, [state, schedule, finishRound]);

  const revealHint = useCallback(() => {
    setState((s) => {
      if (s.hintUsed || s.guessCount < HINT_UNLOCK_AT) return s;
      return { ...s, hintUsed: true };
    });
  }, []);

  const restart = useCallback(() => {
    setState((s) => ({
      ...initialState(),
      bestScore: s.bestScore,
    }));
  }, []);

  const currentCategory = useMemo(
    () => ROUND_ORDER[state.roundIndex] ?? ROUND_ORDER[0]!,
    [state.roundIndex],
  );

  return {
    state,
    currentCategory,
    actions: {
      startGame,
      typeLetter,
      backspace,
      submitGuess,
      revealHint,
      restart,
    },
  };
}
