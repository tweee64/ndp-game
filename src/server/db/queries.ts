import { desc, asc } from "drizzle-orm";

import { db } from "~/server/db";
import { wordleScores } from "~/server/db/schema";
import type { WordleLeaderboardEntry } from "~/app/_lib/types";

export async function getTopWordleScores(
  limit = 10,
): Promise<WordleLeaderboardEntry[]> {
  const rows = await db.query.wordleScores.findMany({
    orderBy: [desc(wordleScores.score), asc(wordleScores.createdAt)],
    limit,
  });

  return rows.map((row) => ({
    id: row.id,
    playerName: row.playerName,
    score: row.score,
    wordsSolved: row.wordsSolved,
    totalWords: row.totalWords,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function insertWordleScore(entry: {
  playerName: string;
  score: number;
  wordsSolved: number;
  totalWords: number;
}): Promise<void> {
  await db.insert(wordleScores).values(entry);
}
