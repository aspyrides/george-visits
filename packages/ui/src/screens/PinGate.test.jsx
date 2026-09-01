import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PinGate } from "./PinGate.jsx";

const BASE = {
  emoji: "👶",
  title: "Visit Schedule",
  prompt: "Enter the family passcode to continue.",
  placeholder: "Passcode",
  submitLabel: "Continue",
  value: "",
  onChange: () => {},
};

describe("PinGate", () => {
  it("renders the emoji, title and prompt", () => {
    render(<PinGate {...BASE} />);
    expect(screen.getByText("👶")).toHaveClass("emoji-hero");
    expect(screen.getByRole("heading", { name: "Visit Schedule" })).toBeInTheDocument();
    expect(screen.getByText("Enter the family passcode to continue.")).toBeInTheDocument();
  });

  it("masks the passcode input", () => {
    render(<PinGate {...BASE} />);
    expect(screen.getByPlaceholderText("Passcode")).toHaveAttribute("type", "password");
  });

  it("calls onSubmit when the form is submitted", async () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(<PinGate {...BASE} value="1234" onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("shows the error it is given", () => {
    render(<PinGate {...BASE} error="That's not quite right — try again." />);
    expect(screen.getByText("That's not quite right — try again.")).toHaveClass("error");
  });

  it("renders no error element when there is no error", () => {
    const { container } = render(<PinGate {...BASE} />);
    expect(container.querySelector(".error")).toBeNull();
  });
});
