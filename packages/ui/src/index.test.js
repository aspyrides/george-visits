import { describe, it, expect } from "vitest";
import * as ui from "./index.js";

describe("@gv/ui barrel", () => {
  it("exports all 11 primitives", () => {
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
    ]) {
      expect(ui[name], `missing export: ${name}`).toBeDefined();
    }
  });
});
