import { describe, it, expect } from "vitest";
import { BOOKING_ERRORS, isBookingErrorCode } from "./errors.js";

describe("BOOKING_ERRORS", () => {
  it("carries the three codes the app throws today", () => {
    expect(BOOKING_ERRORS).toEqual({
      FULL: "FULL",
      ALREADY_BOOKED: "ALREADY_BOOKED",
      RUN_LIMIT: "RUN_LIMIT",
    });
  });

  it("is frozen", () => {
    expect(Object.isFrozen(BOOKING_ERRORS)).toBe(true);
  });
});

describe("isBookingErrorCode", () => {
  it("accepts known codes", () => {
    expect(isBookingErrorCode("FULL")).toBe(true);
    expect(isBookingErrorCode("RUN_LIMIT")).toBe(true);
  });
  it("rejects anything else", () => {
    expect(isBookingErrorCode("BOOM")).toBe(false);
    expect(isBookingErrorCode(undefined)).toBe(false);
  });
});
