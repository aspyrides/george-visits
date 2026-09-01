import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppHeader } from "./AppHeader.jsx";

describe("AppHeader", () => {
  it("renders the title and emoji", () => {
    render(<AppHeader title="Visit George" emoji="👶" />);
    expect(screen.getByRole("heading", { name: "Visit George" })).toBeInTheDocument();
    expect(screen.getByText("👶")).toHaveClass("emoji");
  });

  it("renders the profile badge when a profile name is given", () => {
    render(<AppHeader title="Visit George" profileName="Aunt Maria · Auntie" />);
    expect(screen.getByText("Aunt Maria · Auntie")).toHaveClass("profile-badge");
  });

  it("omits the badge entirely when there is no profile name", () => {
    const { container } = render(<AppHeader title="Visit George" />);
    expect(container.querySelector(".profile-badge")).toBeNull();
  });

  it("calls onEditProfile when the edit button is clicked", async () => {
    const onEditProfile = vi.fn();
    render(<AppHeader title="Visit George" profileName="Aunt Maria" editLabel="Edit" onEditProfile={onEditProfile} />);
    await userEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(onEditProfile).toHaveBeenCalledOnce();
  });

  it("omits the edit button when no handler is given", () => {
    render(<AppHeader title="Visit George" profileName="Aunt Maria" />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("omits the emoji element when no emoji is given", () => {
    const { container } = render(<AppHeader title="Visit George" />);
    expect(container.querySelector(".emoji")).toBeNull();
  });
});
