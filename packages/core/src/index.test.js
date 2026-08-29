import { describe, it, expect } from "vitest";
import * as core from "./index.js";

describe("@gv/core barrel", () => {
  it("re-exports the public surface", () => {
    for (const name of [
      "pad2",
      "toISODate",
      "fromISODate",
      "addDays",
      "addMonths",
      "isSameDay",
      "isPastDay",
      "formatDayLabel",
      "formatDayShort",
      "timeToMinutes",
      "minutesToTime",
      "generateSlotTimes",
      "formatTime12h",
      "isPastSlot",
      "runLengthAt",
      "checkConsecutiveRule",
      "BOOKING_ERRORS",
      "isBookingErrorCode",
    ]) {
      expect(core[name], `missing export: ${name}`).toBeDefined();
    }
  });
});
