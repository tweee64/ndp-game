import type { ClueSegment, RoundCategory, RoundConfig, WordEntry } from "~/app/_lib/types";

export const ROUND_ORDER: RoundConfig[] = [
  { key: "instinct", label: "HEARTLAND INSTINCT" },
  { key: "kopitiam", label: "KOPITIAM TERMS" },
  { key: "slang", label: "LOCAL SLANG" },
];

/**
 * Parses `**bold**` markers into safe clue segments (no raw HTML / no
 * dangerouslySetInnerHTML), matching the reference prototype's `<b>` emphasis.
 */
function clue(text: string): ClueSegment[] {
  const segments: ClueSegment[] = [];
  const parts = text.split("**");
  parts.forEach((part, i) => {
    if (part === "") return;
    segments.push({ text: part, emphasis: i % 2 === 1 });
  });
  return segments;
}

function word(word: string, clueText: string): WordEntry {
  return { word, clue: clue(clueText) };
}

export const WORD_BANK: Record<RoundCategory, WordEntry[]> = {
  instinct: [
    word(
      "CHOPE",
      "To **reserve** a seat or table using a tissue packet or umbrella — without asking anyone.",
    ),
    word(
      "SABO",
      "To (often jokingly) get a friend into trouble or make them look silly — short for 'sabotage'.",
    ),
    word("LEPAK", "To relax, chill, or hang out with no particular agenda."),
    word(
      "PADANG",
      "The historic open field beside City Hall that has hosted National Day Parade marches for decades.",
    ),
  ],
  kopitiam: [
    word(
      "KOSONG",
      "Kopitiam term meaning **'no sugar'** when added after a drink order.",
    ),
    word("PENG", "Kopitiam term meaning **'iced'** when added after a drink order."),
    word(
      "DABAO",
      "To **takeaway/pack** your food instead of eating in — a kopitiam-counter essential.",
    ),
  ],
  slang: [
    word(
      "SHIOK",
      "Exclamation for something extremely satisfying, delicious, or enjoyable.",
    ),
    word(
      "KIASU",
      "Afraid of losing out — always needs to come out ahead of everyone else.",
    ),
    word("PAISEH", "Feeling shy, embarrassed, or awkward about something."),
    word("GOSTAN", "To reverse a vehicle — from the English 'go astern'."),
    word("ALAMAK", "Exclamation of shock, dismay, or surprise."),
    word(
      "BLUR",
      "Confused, clueless, or slow to catch on to what's happening.",
    ),
  ],
};

// Defensive dev-time check: fail the build rather than at runtime if a pool is empty.
for (const round of ROUND_ORDER) {
  const pool = WORD_BANK[round.key];
  if (pool.length === 0) {
    throw new Error(`WORD_BANK category "${round.key}" must not be empty`);
  }
}

export function pickWord(category: RoundCategory): WordEntry {
  const pool = WORD_BANK[category];
  const entry = pool[Math.floor(Math.random() * pool.length)];
  if (!entry) {
    throw new Error(`WORD_BANK category "${category}" must not be empty`);
  }
  return entry;
}
