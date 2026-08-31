import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "./EmptyState.jsx";

describe("EmptyState", () => {
  it("renders its children with the empty-state class", () => {
    render(<EmptyState>You haven’t booked a visit yet.</EmptyState>);
    expect(screen.getByText("You haven’t booked a visit yet.")).toHaveClass("empty-state");
  });
});
