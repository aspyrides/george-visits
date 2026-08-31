import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Toast } from "./Toast.jsx";

describe("Toast", () => {
  it("renders its message", () => {
    render(<Toast message="Visit booked!" />);
    expect(screen.getByText("Visit booked!")).toHaveClass("toast");
  });
  it("adds the error class for the error tone", () => {
    render(<Toast message="Something went wrong." tone="error" />);
    expect(screen.getByText("Something went wrong.")).toHaveClass("toast", "error");
  });
  it("has no error class by default", () => {
    render(<Toast message="Visit booked!" />);
    expect(screen.getByText("Visit booked!")).not.toHaveClass("error");
  });
  it("renders nothing when there is no message", () => {
    const { container } = render(<Toast message="" />);
    expect(container).toBeEmptyDOMElement();
  });
});
