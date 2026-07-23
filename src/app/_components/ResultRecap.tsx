"use client";

import { useState } from "react";

import { submitWordleScore } from "~/app/actions";
import type { RoundResult, TileStatus } from "~/app/_lib/types";

interface ResultRecapProps {
  roundResults: RoundResult[];
  score: number;
  bestScore: number;
  justHitNewBest: boolean;
  totalRounds: number;
  onPlayAgain: () => void;
  onScoreSaved: () => void;
}

function emojiForStatus(status: TileStatus): string {
  if (status === "correct") return "🟩";
  if (status === "present") return "🟨";
  return "⬛";
}

function emojiRow(statuses: TileStatus[]): string {
  return statuses.map(emojiForStatus).join("");
}

function computeVerdict(
  solvedCount: number,
  totalAttempts: number,
): { stamp: string; note: string } {
  if (solvedCount === 3 && totalAttempts <= 6) {
    return {
      stamp: "WORDSMITH OF THE LITTLE RED DOT",
      note: "All three words, almost no wasted guesses. Certified local.",
    };
  }
  if (solvedCount === 3) {
    return {
      stamp: "TRUE BLUE SINGAPOREAN",
      note: "Solved every word — a few guesses here and there, but you know your stuff.",
    };
  }
  if (solvedCount === 2) {
    return {
      stamp: "CERTIFIED HEARTLANDER",
      note: "Two out of three — solid local vocabulary.",
    };
  }
  if (solvedCount === 1) {
    return {
      stamp: "HONORARY PR",
      note: "One word landed. Time to lepak at more kopitiams.",
    };
  }
  return {
    stamp: "TOURIST VIBES",
    note: "None landed this time — the Singlish dictionary awaits.",
  };
}

export function ResultRecap({
  roundResults,
  score,
  bestScore,
  justHitNewBest,
  totalRounds,
  onPlayAgain,
  onScoreSaved,
}: ResultRecapProps) {
  const [playerName, setPlayerName] = useState("");
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [saveError, setSaveError] = useState("");
  const [toast, setToast] = useState("");

  const solvedCount = roundResults.filter((r) => r.solved).length;
  const totalAttempts = roundResults.reduce(
    (sum, r) => sum + (r.solved ? r.attempts : 6),
    0,
  );
  const { stamp, note } = computeVerdict(solvedCount, totalAttempts);

  async function handleSave() {
    setSaveState("saving");
    setSaveError("");
    const result = await submitWordleScore({
      playerName,
      score,
      wordsSolved: solvedCount,
      totalWords: totalRounds,
    });
    if (result.ok) {
      setSaveState("saved");
      onScoreSaved();
    } else {
      setSaveState("error");
      setSaveError(result.error);
    }
  }

  async function handleCopy() {
    const lines = roundResults.map(
      (r) =>
        `${r.word}: ${r.solved ? `${r.attempts}/6` : "X/6"}\n${r.guesses
          .map((g) => emojiRow(g.statuses))
          .join("\n")}`,
    );
    const text = `SG61 Word Ticket — ${score} pts\n\n${lines.join("\n\n")}`;
    try {
      await navigator.clipboard.writeText(text);
      setToast("Copied to clipboard");
    } catch {
      setToast("Copy not available — screenshot instead");
    }
    setTimeout(() => setToast(""), 1600);
  }

  return (
    <div className="text-center">
      <p className="mb-2.5 font-[family-name:var(--font-mono)] text-[11px] tracking-wide text-[var(--teal)] uppercase">
        Grand Finale
      </p>

      <div className="mb-4 space-y-3 text-left font-[family-name:var(--font-mono)] text-xs leading-relaxed text-[#5a5147]">
        {roundResults.map((r) => (
          <div key={r.word}>
            <b className="text-[var(--ink)]">{r.word}</b> ({r.category}) —{" "}
            {r.solved ? `${r.attempts}/6` : "X/6"}
            <br />
            {r.guesses.map((g, i) => (
              <div key={i}>{emojiRow(g.statuses)}</div>
            ))}
          </div>
        ))}
      </div>

      <div
        className="ticket-stamp mx-auto mb-2.5 inline-block border-[3px] border-[var(--red)] px-4 py-1.5 font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-wide text-[var(--red)]"
      >
        {stamp}
      </div>
      <p className="mb-2 text-sm text-[#5a5147]">{note}</p>
      <p className="mb-1 font-[family-name:var(--font-mono)] text-sm text-[var(--ink)]">
        Total score: <b>{score}</b>
      </p>
      {justHitNewBest && (
        <p className="mb-4 font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--red)]">
          NEW HIGH SCORE
        </p>
      )}
      {!justHitNewBest && (
        <p className="mb-4 font-[family-name:var(--font-mono)] text-xs tracking-wide text-[#5a5147]">
          Personal best: {bestScore}
        </p>
      )}

      <div className="mb-4 space-y-2 border-t border-dashed border-[var(--paper-shadow)] pt-4">
        <label className="block text-left font-[family-name:var(--font-mono)] text-[11px] tracking-wide text-[#5a5147] uppercase">
          Save your score
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={playerName}
            maxLength={40}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Your name"
            className="min-w-0 flex-1 rounded-[2px] border border-[var(--paper-shadow)] bg-white/40 px-3 py-2 text-sm text-[var(--ink)] focus-visible:ring-2 focus-visible:ring-[var(--teal)] focus-visible:outline-none"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={saveState === "saving" || saveState === "saved"}
            className="shrink-0 rounded-[2px] bg-[var(--red)] px-4 py-2 font-[family-name:var(--font-mono)] text-xs font-semibold tracking-wide text-[var(--paper)] uppercase shadow-[0_6px_0_var(--red-deep)] transition-colors hover:bg-[var(--red-deep)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saveState === "saved" ? "Saved" : "Save"}
          </button>
        </div>
        {saveState === "error" && (
          <p role="alert" className="text-left text-xs text-[var(--red)]">
            {saveError}
          </p>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2.5">
        <button
          type="button"
          onClick={onPlayAgain}
          className="rounded-[2px] border-[1.5px] border-[var(--ink)] px-5 py-3 font-[family-name:var(--font-mono)] text-xs font-semibold tracking-wide text-[var(--ink)] uppercase transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]"
        >
          Play again
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-[2px] bg-[var(--red)] px-5 py-3 font-[family-name:var(--font-mono)] text-xs font-semibold tracking-wide text-[var(--paper)] uppercase transition-colors hover:bg-[var(--red-deep)]"
        >
          Copy result
        </button>
      </div>
      <p
        aria-live="polite"
        className="mt-3 h-3.5 font-[family-name:var(--font-mono)] text-[11px] text-[var(--teal)]"
      >
        {toast}
      </p>
    </div>
  );
}
