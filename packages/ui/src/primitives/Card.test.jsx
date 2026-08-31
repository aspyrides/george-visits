import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "./Card.jsx";

describe("Card", () => {
  it("renders children inside a card", () => {
    render(<Card>Hello</Card>);
    expect(screen.getByText("Hello")).toHaveClass("card");
  });
  it("adds the centered class when centered", () => {
    render(<Card centered>Hello</Card>);
    expect(screen.getByText("Hello")).toHaveClass("card", "centered");
  });
  it("is not centered by default", () => {
    render(<Card>Hello</Card>);
    expect(screen.getByText("Hello")).not.toHaveClass("centered");
  });
  it("appends an extra className", () => {
    render(<Card className="extra">Hello</Card>);
    expect(screen.getByText("Hello")).toHaveClass("card", "extra");
  });
});
