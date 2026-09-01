import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileSetup } from "./ProfileSetup.jsx";

const OPTIONS = [
  { value: "", label: "Prefer not to say" },
  { value: "Auntie", label: "Auntie" },
  { value: "Uncle", label: "Uncle" },
];

const BASE = {
  emoji: "💐",
  heading: "Who's visiting?",
  subtitle: "So everyone can see who's booked a slot.",
  nameLabel: "Your name",
  namePlaceholder: "e.g. Aunt Maria",
  name: "",
  onNameChange: () => {},
  relationshipLabel: "Relationship to baby (optional)",
  relationshipOptions: OPTIONS,
  relationship: "",
  onRelationshipChange: () => {},
  submitLabel: "Continue",
};

describe("ProfileSetup", () => {
  it("renders the heading and subtitle", () => {
    render(<ProfileSetup {...BASE} />);
    expect(screen.getByRole("heading", { name: "Who's visiting?" })).toBeInTheDocument();
    expect(screen.getByText("So everyone can see who's booked a slot.")).toBeInTheDocument();
  });

  it("binds the name field to its value", () => {
    render(<ProfileSetup {...BASE} name="Aunt Maria" />);
    expect(screen.getByLabelText("Your name")).toHaveValue("Aunt Maria");
  });

  it("renders every relationship option", () => {
    render(<ProfileSetup {...BASE} />);
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("calls onSubmit when the form is submitted", async () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(<ProfileSetup {...BASE} name="Aunt Maria" onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("shows a cancel button only when a cancel handler is given", async () => {
    const onCancel = vi.fn();
    render(<ProfileSetup {...BASE} cancelLabel="Cancel" onCancel={onCancel} />);
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("omits the cancel button when there is no cancel handler", () => {
    render(<ProfileSetup {...BASE} />);
    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
  });
});
