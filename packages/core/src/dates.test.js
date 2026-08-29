import { describe, it, expect } from "vitest";
import {
  pad2,
  toISODate,
  fromISODate,
  addDays,
  addMonths,
  isSameDay,
  isPastDay,
  formatDayLabel,
  formatDayShort,
} from "./dates.js";

describe("pad2", () => {
  it("pads single digits", () => {
    expect(pad2(1)).toBe("01");
  });
  it("leaves two digits alone", () => {
    expect(pad2(12)).toBe("12");
  });
});

describe("toISODate", () => {
  it("formats a date as YYYY-MM-DD in local time", () => {
    expect(toISODate(new Date(2026, 7, 29))).toBe("2026-08-29");
  });
  it("pads single-digit months and days", () => {
    expect(toISODate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("fromISODate", () => {
  it("parses to local midnight", () => {
    const d = fromISODate("2026-08-29");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(7);
    expect(d.getDate()).toBe(29);
    expect(d.getHours()).toBe(0);
  });
  it("round-trips with toISODate", () => {
    expect(toISODate(fromISODate("2026-02-01"))).toBe("2026-02-01");
  });
});

describe("addDays", () => {
  it("adds days", () => {
    expect(toISODate(addDays(new Date(2026, 7, 29), 3))).toBe("2026-09-01");
  });
  it("subtracts with a negative count", () => {
    expect(toISODate(addDays(new Date(2026, 7, 1), -1))).toBe("2026-07-31");
  });
  it("does not mutate its argument", () => {
    const d = new Date(2026, 7, 29);
    addDays(d, 5);
    expect(toISODate(d)).toBe("2026-08-29");
  });
});

describe("addMonths", () => {
  it("returns the first of the resulting month", () => {
    expect(toISODate(addMonths(new Date(2026, 7, 29), 1))).toBe("2026-09-01");
  });
  it("crosses a year boundary", () => {
    expect(toISODate(addMonths(new Date(2026, 11, 15), 1))).toBe("2027-01-01");
  });
  it("goes backwards", () => {
    expect(toISODate(addMonths(new Date(2026, 0, 15), -1))).toBe("2025-12-01");
  });
});

describe("isSameDay", () => {
  it("is true for the same calendar day at different times", () => {
    expect(isSameDay(new Date(2026, 7, 29, 1), new Date(2026, 7, 29, 23))).toBe(true);
  });
  it("is false for different days", () => {
    expect(isSameDay(new Date(2026, 7, 29), new Date(2026, 7, 30))).toBe(false);
  });
});

describe("isPastDay", () => {
  const now = new Date(2026, 7, 29, 12, 0);
  it("is false for today, regardless of time of day", () => {
    expect(isPastDay(new Date(2026, 7, 29, 23, 59), now)).toBe(false);
  });
  it("is true for yesterday", () => {
    expect(isPastDay(new Date(2026, 7, 28), now)).toBe(true);
  });
  it("is false for tomorrow", () => {
    expect(isPastDay(new Date(2026, 7, 30), now)).toBe(false);
  });
});

describe("formatDayLabel", () => {
  it("renders weekday, month and day", () => {
    expect(formatDayLabel(new Date(2026, 7, 29), "en-US")).toBe("Saturday, August 29");
  });
});

describe("formatDayShort", () => {
  it("renders abbreviated month and day", () => {
    expect(formatDayShort(new Date(2026, 7, 29), "en-US")).toBe("Aug 29");
  });
});
