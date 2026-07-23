import { useEffect, useRef, useState } from "react";

import type { GuessRecord, TileStatus } from "~/app/_lib/types";

interface GuessGridProps {
  wordLength: number;
  maxGuesses: number;
  guesses: GuessRecord[];
  currentGuess: string;
  locked: boolean;
  shakeToken: number;
}

const STATUS_CLASSES: Record<TileStatus, string> = {
  correct: "bg-[var(--teal)] border-[var(--teal)] text-[var(--paper)]",
  present: "bg-[var(--gold)] border-[var(--gold)] text-[var(--ink)]",
  absent:
    "bg-[var(--paper-shadow)]/60 border-[var(--paper-shadow)] text-[#5a5147]",
};

export function GuessGrid({
  wordLength,
  maxGuesses,
  guesses,
  currentGuess,
  locked,
  shakeToken,
}: GuessGridProps) {
  const activeRowIndex = guesses.length;
  const [shaking, setShaking] = useState(false);
  const prevShakeToken = useRef(shakeToken);

  useEffect(() => {
    if (shakeToken !== prevShakeToken.current) {
      prevShakeToken.current = shakeToken;
      setShaking(true);
      const id = setTimeout(() => setShaking(false), 400);
      return () => clearTimeout(id);
    }
  }, [shakeToken]);

  const rows = Array.from({ length: maxGuesses }, (_, r) => {
    const submitted = guesses[r];
    const isActiveRow = r === activeRowIndex && !submitted;
    const isJustSubmittedRow = r === guesses.length - 1 && locked;

    return (
      <div
        key={r}
        className={
          "flex gap-1.5" + (isActiveRow && shaking ? " ticket-shake" : "")
        }
      >
        {Array.from({ length: wordLength }, (_, c) => {
          const letter = submitted
            ? submitted.guess[c]
            : isActiveRow
              ? (currentGuess[c] ?? "")
              : "";
          const status = submitted?.statuses[c];
          return (
            <div
              key={c}
              style={
                isJustSubmittedRow
                  ? { animationDelay: `${c * 220}ms` }
                  : undefined
              }
              className={
                "flex h-[38px] w-[38px] items-center justify-center rounded-[3px] border-2 font-[family-name:var(--font-mono)] text-lg font-semibold uppercase text-[var(--ink)] " +
                (status
                  ? STATUS_CLASSES[status]
                  : "border-[var(--paper-shadow)] bg-black/[0.02]") +
                (letter && !status ? " border-[#5a5147]/40 scale-[1.03]" : "") +
                (isJustSubmittedRow ? " ticket-tile-flip" : "")
              }
            >
              {letter}
            </div>
          );
        })}
      </div>
    );
  });

  return (
    <div className="mb-4 flex flex-col items-center gap-1.5">{rows}</div>
  );
}
