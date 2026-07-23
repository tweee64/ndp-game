import type { ClueSegment } from "~/app/_lib/types";

interface ClueCardProps {
  categoryLabel: string;
  wordLength: number;
  clue: ClueSegment[];
  hintUsed: boolean;
  hintUnlocked: boolean;
  hintUnlockAt: number;
  hintPenalty: number;
  onRevealHint: () => void;
}

export function ClueCard({
  categoryLabel,
  wordLength,
  clue,
  hintUsed,
  hintUnlocked,
  hintUnlockAt,
  hintPenalty,
  onRevealHint,
}: ClueCardProps) {
  const canReveal = hintUnlocked && !hintUsed;

  let hintLabel: string;
  if (hintUsed) {
    hintLabel = `Hint revealed (-${hintPenalty} pts if solved)`;
  } else if (canReveal) {
    hintLabel = `Reveal Hint (-${hintPenalty} pts)`;
  } else {
    hintLabel = `🔒 Hint unlocks after ${hintUnlockAt} guesses`;
  }

  return (
    <div className="mb-3 text-center">
      <span className="mb-2.5 inline-block rounded-[2px] border border-[var(--teal)] px-2.5 py-0.5 font-[family-name:var(--font-mono)] text-[10.5px] tracking-wide text-[var(--teal)] uppercase">
        {categoryLabel}
      </span>

      <p
        className={
          "mb-3 rounded-[4px] border border-[var(--paper-shadow)] bg-black/[0.03] px-3.5 py-2.5 text-left text-[13.5px] leading-relaxed" +
          (hintUsed ? " text-[var(--ink)]" : " text-[#5a5147] italic")
        }
      >
        {hintUsed ? (
          <>
            <b className="not-italic text-[var(--red)]">Clue: </b>
            {clue.map((seg, i) =>
              seg.emphasis ? (
                <b key={i} className="not-italic text-[var(--red)]">
                  {seg.text}
                </b>
              ) : (
                <span key={i}>{seg.text}</span>
              ),
            )}
          </>
        ) : (
          `${wordLength} letters — clue locked. Guess it cold, or unlock a hint after ${hintUnlockAt} guesses.`
        )}
      </p>

      <button
        type="button"
        disabled={!canReveal}
        onClick={onRevealHint}
        className="mx-auto block rounded-[2px] border-[1.5px] border-[var(--ink)] bg-transparent px-4 py-2 font-[family-name:var(--font-mono)] text-[11px] font-semibold tracking-wide text-[var(--ink)] uppercase transition-colors focus-visible:ring-2 focus-visible:ring-[var(--teal)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:bg-[var(--ink)] enabled:hover:text-[var(--paper)]"
      >
        {hintLabel}
      </button>
    </div>
  );
}
