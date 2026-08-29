import { describe, it, expect } from "vitest";
import {
  timeToMinutes,
  minutesToTime,
  generateSlotTimes,
  formatTime12h,
  isPastSlot,
} from "./slots.js";

const CFG = { dayStart: "08:30", dayEnd: "18:30", slotMinutes: 30 };

describe("timeToMinutes", () => {
  it("converts midnight", () => {
    expect(timeToMinutes("00:00")).toBe(0);
  });
  it("converts a morning time", () => {
    expect(timeToMinutes("08:30")).toBe(510);
  });
  it("converts an evening time", () => {
    expect(timeToMinutes("18:30")).toBe(1110);
  });
});

describe("minutesToTime", () => {
  it("formats with zero padding", () => {
    expect(minutesToTime(510)).toBe("08:30");
  });
  it("round-trips with timeToMinutes", () => {
    expect(minutesToTime(timeToMinutes("14:00"))).toBe("14:00");
  });
});

describe("generateSlotTimes", () => {
  const slots = generateSlotTimes(CFG);

  it("starts at dayStart", () => {
    expect(slots[0]).toBe("08:30");
  });
  it("excludes dayEnd", () => {
    expect(slots).not.toContain("18:30");
    expect(slots[slots.length - 1]).toBe("18:00");
  });
  it("produces one slot per slotMinutes across the window", () => {
    expect(slots).toHaveLength(20);
  });
  it("respects a different interval", () => {
    expect(generateSlotTimes({ dayStart: "09:00", dayEnd: "10:00", slotMinutes: 15 }))
      .toEqual(["09:00", "09:15", "09:30", "09:45"]);
  });
  it("returns empty when the window is inverted", () => {
    expect(generateSlotTimes({ dayStart: "18:00", dayEnd: "09:00", slotMinutes: 30 })).toEqual([]);
  });
});

describe("formatTime12h", () => {
  it("formats morning", () => {
    expect(formatTime12h("08:30")).toBe("8:30 AM");
  });
  it("formats afternoon", () => {
    expect(formatTime12h("13:00")).toBe("1:00 PM");
  });
  it("formats noon as 12 PM", () => {
    expect(formatTime12h("12:00")).toBe("12:00 PM");
  });
  it("formats midnight as 12 AM", () => {
    expect(formatTime12h("00:00")).toBe("12:00 AM");
  });
});

describe("isPastSlot", () => {
  const now = new Date(2026, 7, 29, 12, 0);

  it("is true for an earlier slot today", () => {
    expect(isPastSlot("2026-08-29", "11:30", now)).toBe(true);
  });
  it("is false for a later slot today", () => {
    expect(isPastSlot("2026-08-29", "12:30", now)).toBe(false);
  });
  it("is true for any slot yesterday", () => {
    expect(isPastSlot("2026-08-28", "23:30", now)).toBe(true);
  });
  it("is false for any slot tomorrow", () => {
    expect(isPastSlot("2026-08-30", "00:00", now)).toBe(false);
  });
});
