import type { TileStatus } from "~/app/_lib/types";

interface OnScreenKeyboardProps {
  keyStatus: Record<string, TileStatus>;
  onKey: (key: string) => void;
}

const KEY_ROWS: string[][] = [
  "QWERTYUIOP".split(""),
  "ASDFGHJKL".split(""),
  ["ENTER", ..."ZXCVBNM".split(""), "BACK"],
];

const STATUS_CLASSES: Record<TileStatus, string> = {
  correct: "bg-[var(--teal)] text-[var(--paper)]",
  present: "bg-[var(--gold)] text-[var(--ink)]",
  absent: "bg-black/[0.06] text-[#8a8072]",
};

export function OnScreenKeyboard({ keyStatus, onKey }: OnScreenKeyboardProps) {
  return (
    <div className="flex flex-col gap-1">
      {KEY_ROWS.map((row, i) => (
        <div key={i} className="flex justify-center gap-1.5">
          {row.map((k) => {
            const isWide = k === "ENTER" || k === "BACK";
            const status = keyStatus[k];
            return (
              <button
                key={k}
                type="button"
                onClick={() => onKey(k)}
                aria-label={k === "BACK" ? "Backspace" : k}
                className={
                  "rounded-[3px] border-none px-2 py-2.5 font-[family-name:var(--font-mono)] text-[11.5px] font-semibold uppercase transition-colors focus-visible:ring-2 focus-visible:ring-[var(--teal)] focus-visible:outline-none " +
                  (isWide ? "min-w-[44px] px-1.5 text-[10px]" : "min-w-[26px]") +
                  " " +
                  (status
                    ? STATUS_CLASSES[status]
                    : "bg-black/[0.06] text-[var(--ink)] hover:bg-black/[0.12]")
                }
              >
                {k === "BACK" ? "⌫" : k}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
