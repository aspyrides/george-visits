import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Chip } from "./Chip.jsx";

describe("Chip", () => {
  it("renders its children with the guest-chip class", () => {
    render(<Chip>Aunt Maria</Chip>);
    expect(screen.getByText("Aunt Maria")).toHaveClass("guest-chip");
  });
});
