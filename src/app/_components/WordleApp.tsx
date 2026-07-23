"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { ClueCard } from "~/app/_components/ClueCard";
import { GuessGrid } from "~/app/_components/GuessGrid";
import { OnScreenKeyboard } from "~/app/_components/OnScreenKeyboard";
import { ResultRecap } from "~/app/_components/ResultRecap";
import { RoundHud } from "~/app/_components/RoundHud";
import { TicketShell } from "~/app/_components/TicketShell";
import {
  HINT_PENALTY,
  HINT_UNLOCK_AT,
  MAX_GUESSES,
  TOTAL_ROUNDS,
  useWordleEngine,
} from "~/app/_components/useWordleEngine";

export function WordleApp() {
  const { state, currentCategory, actions } = useWordleEngine();
  const router = useRouter();

  useEffect(() => {
    if (state.screen !== "round") return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Enter") {
        actions.submitGuess();
        return;
      }
      if (e.key === "Backspace") {
        actions.backspace();
        return;
      }
      const k = e.key.toUpperCase();
      if (/^[A-Z]$/.test(k)) actions.typeLetter(k);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state.screen, actions]);

  function handleKey(key: string) {
    if (key === "ENTER") return actions.submitGuess();
    if (key === "BACK") return actions.backspace();
    actions.typeLetter(key);
  }

  return (
    <div className="ticket-stage flex flex-col items-center">
      {state.screen === "round" && (
        <RoundHud
          roundNumber={state.roundIndex + 1}
          totalRounds={TOTAL_ROUNDS}
          guessCount={Math.min(state.guessCount + 1, MAX_GUESSES)}
          maxGuesses={MAX_GUESSES}
          score={state.score}
          bestScore={state.bestScore}
        />
      )}

      <TicketShell>
        <div key={state.screen === "round" ? state.roundIndex : state.screen} className="ticket-feed">
          {state.screen === "intro" && (
            <div className="text-center">
              <p className="mb-2.5 font-[family-name:var(--font-mono)] text-[11px] tracking-wide text-[var(--teal)] uppercase">
                SG61 · Word Ticket
              </p>
              <h1 className="mb-3.5 font-[family-name:var(--font-display)] text-[clamp(34px,8vw,46px)] leading-[0.95] font-extrabold text-[var(--red)]">
                GUESS THE WORD
              </h1>
              <p className="mb-6.5 text-sm leading-relaxed text-[#5a5147]">
                3 rounds, 3 local words — Heartland Instinct → Kopitiam Terms →
                Local Slang. No clue upfront — guess it cold, or unlock a hint
                after {HINT_UNLOCK_AT} guesses for a score penalty. 6 guesses
                per word.
              </p>
              <button
                type="button"
                onClick={actions.startGame}
                className="w-full rounded-[2px] bg-[var(--red)] px-5 py-3.5 font-[family-name:var(--font-mono)] text-[13px] font-semibold tracking-wide text-[var(--paper)] uppercase shadow-[0_6px_0_var(--red-deep)] transition-colors hover:bg-[var(--red-deep)] focus-visible:ring-2 focus-visible:ring-[var(--teal)] focus-visible:outline-none"
              >
                Take a number →
              </button>
            </div>
          )}

          {state.screen === "round" && state.currentWord && (
            <div>
              <ClueCard
                categoryLabel={currentCategory.label}
                wordLength={state.currentWord.word.length}
                clue={state.currentWord.clue}
                hintUsed={state.hintUsed}
                hintUnlocked={state.guessCount >= HINT_UNLOCK_AT}
                hintUnlockAt={HINT_UNLOCK_AT}
                hintPenalty={HINT_PENALTY}
                onRevealHint={actions.revealHint}
              />
              <GuessGrid
                wordLength={state.currentWord.word.length}
                maxGuesses={MAX_GUESSES}
                guesses={state.guesses}
                currentGuess={state.currentGuess}
                locked={state.locked}
                shakeToken={state.shakeToken}
              />
              <p
                aria-live="polite"
                className={
                  "mb-3 min-h-[18px] text-center font-[family-name:var(--font-mono)] text-sm " +
                  (state.feedbackTone === "win"
                    ? "text-[var(--teal)]"
                    : state.feedbackTone === "lose"
                      ? "text-[var(--red)]"
                      : "text-[#5a5147]")
                }
              >
                {state.feedback}
              </p>
              <OnScreenKeyboard keyStatus={state.keyStatus} onKey={handleKey} />
            </div>
          )}

          {state.screen === "result" && (
            <ResultRecap
              roundResults={state.roundResults}
              score={state.score}
              bestScore={state.bestScore}
              justHitNewBest={state.justHitNewBest}
              totalRounds={TOTAL_ROUNDS}
              onPlayAgain={actions.restart}
              onScoreSaved={() => router.refresh()}
            />
          )}
        </div>
      </TicketShell>
    </div>
  );
}
