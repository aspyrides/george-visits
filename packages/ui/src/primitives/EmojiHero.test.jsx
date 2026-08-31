import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmojiHero } from "./EmojiHero.jsx";

describe("EmojiHero", () => {
  it("renders the emoji with the emoji-hero class", () => {
    render(<EmojiHero emoji="👶" />);
    expect(screen.getByText("👶")).toHaveClass("emoji-hero");
  });
});
