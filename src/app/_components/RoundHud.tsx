interface RoundHudProps {
  roundNumber: number;
  totalRounds: number;
  guessCount: number;
  maxGuesses: number;
  score: number;
  bestScore: number;
}

export function RoundHud({
  roundNumber,
  totalRounds,
  guessCount,
  maxGuesses,
  score,
  bestScore,
}: RoundHudProps) {
  return (
    <div className="mb-4 flex max-w-[min(440px,92vw)] flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-[3px] bg-[var(--ink)] px-4.5 py-2 font-[family-name:var(--font-mono)] text-[11.5px] tracking-wide text-[var(--gold)] shadow-[inset_0_0_0_1px_rgba(232,178,61,0.25),0_6px_16px_rgba(0,0,0,0.35)]">
      <span>
        ROUND <b className="text-[var(--paper)]">{roundNumber}</b>/{totalRounds}
      </span>
      <span className="opacity-35">·</span>
      <span>
        GUESS <b className="text-[var(--paper)]">{guessCount}</b>/{maxGuesses}
      </span>
      <span className="opacity-35">·</span>
      <span>
        SCORE <b className="text-[var(--paper)]">{score}</b>
      </span>
      <span className="opacity-35">·</span>
      <span>
        BEST <b className="text-[var(--paper)]">{bestScore}</b>
      </span>
    </div>
  );
}
