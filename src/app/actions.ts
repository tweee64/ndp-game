"use server";

import { revalidatePath } from "next/cache";

import { getTopWordleScores, insertWordleScore } from "~/server/db/queries";
import type { WordleLeaderboardEntry } from "~/app/_lib/types";

const MAX_NAME_LENGTH = 40;

export async function submitWordleScore(input: {
  playerName: string;
  score: number;
  wordsSolved: number;
  totalWords: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const playerName = input.playerName.trim().slice(0, MAX_NAME_LENGTH);
    if (!playerName) {
      return { ok: false, error: "Please enter a name to save your score." };
    }
    if (
      !Number.isFinite(input.score) ||
      !Number.isFinite(input.wordsSolved) ||
      !Number.isFinite(input.totalWords)
    ) {
      return { ok: false, error: "Invalid score submitted." };
    }

    await insertWordleScore({
      playerName,
      score: Math.max(0, Math.trunc(input.score)),
      wordsSolved: Math.max(0, Math.trunc(input.wordsSolved)),
      totalWords: Math.max(0, Math.trunc(input.totalWords)),
    });

    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    console.error("submitWordleScore failed", error);
    return { ok: false, error: "Couldn't save your score. Please try again." };
  }
}

export async function getWordleLeaderboard(
  limit = 10,
): Promise<WordleLeaderboardEntry[]> {
  try {
    return await getTopWordleScores(limit);
  } catch (error) {
    console.error("getWordleLeaderboard failed", error);
    return [];
  }
}
