import { describe, it, expect } from "vitest";
import * as ui from "./index.js";

describe("@gv/ui barrel", () => {
  it("exports all 24 components", () => {
    for (const name of [
      "Button",
      "Card",
      "Chip",
      "EmojiHero",
      "EmptyState",
      "FormError",
      "Modal",
      "SelectField",
      "Tabs",
      "TextField",
      "Toast",
      "AppHeader",
      "LegendBar",
      "PagerNav",
      "StatusDot",
      "WeekdayRow",
      "BookingRow",
      "CalendarGrid",
      "DayCell",
      "GuestList",
      "SlotCard",
      "MyBookingsTab",
      "PinGate",
      "ProfileSetup",
    ]) {
      expect(ui[name], `missing export: ${name}`).toBeDefined();
    }
  });
});
