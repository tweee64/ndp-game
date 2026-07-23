import { getWordleLeaderboard } from "~/app/actions";

export async function Leaderboard() {
  const entries = await getWordleLeaderboard(10);

  return (
    <div className="mt-5 w-[min(440px,92vw)] rounded-[4px] border border-[var(--paper-shadow)] bg-[var(--paper)]/95 px-5 py-4">
      <p className="mb-3 font-[family-name:var(--font-mono)] text-[11px] tracking-wide text-[var(--teal)] uppercase">
        Leaderboard
      </p>
      {entries.length === 0 ? (
        <p className="text-sm text-[#5a5147]">
          No scores yet — be the first to play!
        </p>
      ) : (
        <ol className="space-y-1.5 font-[family-name:var(--font-mono)] text-[13px] text-[var(--ink)]">
          {entries.map((entry, i) => (
            <li key={entry.id} className="flex justify-between gap-2">
              <span className="truncate">
                <b>{i + 1}.</b> {entry.playerName}
              </span>
              <span className="shrink-0 text-[#5a5147]">
                {entry.score} pts · {entry.wordsSolved}/{entry.totalWords}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
