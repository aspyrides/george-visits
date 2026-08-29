import { describe, it, expect } from "vitest";
import { runLengthAt, checkConsecutiveRule } from "./rules.js";

const CFG = { slotMinutes: 30, maxConsecutiveSlots: 3 };

describe("runLengthAt", () => {
  it("is 1 for a lone slot", () => {
    expect(runLengthAt(["09:00"], "09:00", 30)).toBe(1);
  });
  it("counts a run extending forwards", () => {
    expect(runLengthAt(["09:00", "09:30", "10:00"], "09:00", 30)).toBe(3);
  });
  it("counts a run extending backwards", () => {
    expect(runLengthAt(["09:00", "09:30", "10:00"], "10:00", 30)).toBe(3);
  });
  it("counts a run from the middle", () => {
    expect(runLengthAt(["09:00", "09:30", "10:00"], "09:30", 30)).toBe(3);
  });
  it("does not count across a gap", () => {
    expect(runLengthAt(["09:00", "09:30", "11:00"], "11:00", 30)).toBe(1);
  });
  it("counts only the run containing the target", () => {
    expect(runLengthAt(["09:00", "09:30", "11:00", "11:30", "12:00"], "09:00", 30)).toBe(2);
  });
  it("returns 0 for a time not in the array", () => {
    expect(runLengthAt([], "09:00", 30)).toBe(0);
  });
});

describe("checkConsecutiveRule", () => {
  it("allows a booking on an empty day", () => {
    expect(checkConsecutiveRule([], "09:00", CFG)).toEqual({ allowed: true });
  });

  it("allows a non-adjacent second booking", () => {
    expect(checkConsecutiveRule(["09:00"], "14:00", CFG)).toEqual({ allowed: true });
  });

  it("rejects a slot already booked", () => {
    expect(checkConsecutiveRule(["09:00"], "09:00", CFG)).toEqual({
      allowed: false,
      reason: "ALREADY_BOOKED",
    });
  });

  it("allows extending a run to exactly the limit", () => {
    expect(checkConsecutiveRule(["09:00", "09:30"], "10:00", CFG)).toEqual({ allowed: true });
  });

  it("allows extending a run backwards to exactly the limit", () => {
    expect(checkConsecutiveRule(["09:30", "10:00"], "09:00", CFG)).toEqual({ allowed: true });
  });

  it("rejects extending a run past the limit", () => {
    expect(checkConsecutiveRule(["09:00", "09:30", "10:00"], "10:30", CFG)).toEqual({
      allowed: false,
      reason: "RUN_LIMIT",
    });
  });

  it("rejects extending a run backwards past the limit", () => {
    expect(checkConsecutiveRule(["09:30", "10:00", "10:30"], "09:00", CFG)).toEqual({
      allowed: false,
      reason: "RUN_LIMIT",
    });
  });

  // The bridging case: two separate legal runs joined by one booking into a
  // single illegal run. This is the case most likely to regress.
  it("rejects a booking that bridges two runs into an over-length one", () => {
    expect(checkConsecutiveRule(["09:00", "09:30", "10:30", "11:00"], "10:00", CFG)).toEqual({
      allowed: false,
      reason: "RUN_LIMIT",
    });
  });

  it("allows a booking that bridges two runs within the limit", () => {
    expect(checkConsecutiveRule(["09:00", "10:00"], "09:30", CFG)).toEqual({ allowed: true });
  });

  it("allows multiple separate blocks in one day", () => {
    expect(checkConsecutiveRule(["09:00", "09:30", "10:00", "14:00"], "14:30", CFG)).toEqual({
      allowed: true,
    });
  });

  it("respects a different limit", () => {
    expect(
      checkConsecutiveRule(["09:00"], "09:30", { slotMinutes: 30, maxConsecutiveSlots: 1 })
    ).toEqual({ allowed: false, reason: "RUN_LIMIT" });
  });

  it("does not mutate the input array", () => {
    const existing = ["09:00", "09:30"];
    checkConsecutiveRule(existing, "10:00", CFG);
    expect(existing).toEqual(["09:00", "09:30"]);
  });

  it("sorts chronologically, not lexicographically, for unpadded times", () => {
    expect(checkConsecutiveRule(["8:30", "9:00", "9:30"], "10:00", CFG)).toEqual({
      allowed: false,
      reason: "RUN_LIMIT",
    });
  });
});
