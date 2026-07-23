import { describe, expect, it } from "vitest";

import {
  HINT_PENALTY,
  evaluateGuess,
  scoreForGuess,
  upgradeKeyStatus,
} from "~/app/_components/useWordleEngine";

describe("evaluateGuess", () => {
  it("marks all-correct guesses", () => {
    expect(evaluateGuess("CHOPE", "CHOPE")).toEqual([
      "correct",
      "correct",
      "correct",
      "correct",
      "correct",
    ]);
  });

  it("marks absent letters not present in the answer", () => {
    expect(evaluateGuess("STEAK", "LEPAK")).toEqual([
      "absent",
      "absent",
      "present",
      "correct",
      "correct",
    ]);
  });

  it("handles repeated letters correctly (does not over-count 'present')", () => {
    expect(evaluateGuess("KIASU", "KIASU")).toEqual([
      "correct",
      "correct",
      "correct",
      "correct",
      "correct",
    ]);
    // Guess has two A's and two B's; answer only has one of each — only one
    // instance of each repeated letter should be marked correct/present.
    expect(evaluateGuess("AABBB", "ABCDE")).toEqual([
      "correct",
      "absent",
      "present",
      "absent",
      "absent",
    ]);
  });

  it("marks present letters only up to the count remaining in the answer", () => {
    // Answer has 2 A's and 3 B's; guess has 3 A's and 2 B's, none aligned
    // positionally. Only as many "present" marks as the answer has letters
    // remaining should be granted.
    const result = evaluateGuess("BBAAA", "AABBB");
    expect(result).toEqual(["present", "present", "present", "present", "absent"]);
  });
});

describe("scoreForGuess", () => {
  it("awards points per the guess-count table when no hint was used", () => {
    expect(scoreForGuess(1, false)).toBe(700);
    expect(scoreForGuess(2, false)).toBe(600);
    expect(scoreForGuess(3, false)).toBe(500);
    expect(scoreForGuess(4, false)).toBe(400);
    expect(scoreForGuess(5, false)).toBe(300);
    expect(scoreForGuess(6, false)).toBe(200);
  });

  it("falls back to 100 for guess counts beyond the table", () => {
    expect(scoreForGuess(7, false)).toBe(100);
  });

  it("applies a hint penalty with a floor of 50", () => {
    expect(scoreForGuess(1, true)).toBe(700 - HINT_PENALTY);
    expect(scoreForGuess(6, true)).toBe(50); // 200 - 150 = 50, at the floor
    expect(scoreForGuess(7, true)).toBe(50); // 100 - 150 would be negative, floored to 50
  });
});

describe("upgradeKeyStatus", () => {
  it("sets the status when there is no previous status", () => {
    expect(upgradeKeyStatus(undefined, "absent")).toBe("absent");
    expect(upgradeKeyStatus(undefined, "present")).toBe("present");
    expect(upgradeKeyStatus(undefined, "correct")).toBe("correct");
  });

  it("upgrades absent -> present -> correct", () => {
    expect(upgradeKeyStatus("absent", "present")).toBe("present");
    expect(upgradeKeyStatus("present", "correct")).toBe("correct");
    expect(upgradeKeyStatus("absent", "correct")).toBe("correct");
  });

  it("never downgrades an existing status", () => {
    expect(upgradeKeyStatus("correct", "present")).toBe("correct");
    expect(upgradeKeyStatus("correct", "absent")).toBe("correct");
    expect(upgradeKeyStatus("present", "absent")).toBe("present");
  });
});
