import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "./Modal.jsx";

describe("Modal", () => {
  it("renders its title, subtitle and children", () => {
    render(<Modal title="Book this slot" subtitle="Saturday at 9:00 AM">Body</Modal>);
    expect(screen.getByRole("heading", { name: "Book this slot" })).toBeInTheDocument();
    expect(screen.getByText("Saturday at 9:00 AM")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", async () => {
    const onClose = vi.fn();
    render(<Modal title="T" onClose={onClose}>Body</Modal>);
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when the overlay itself is clicked", async () => {
    const onClose = vi.fn();
    const { container } = render(<Modal title="T" onClose={onClose}>Body</Modal>);
    await userEvent.click(container.querySelector(".modal-overlay"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does NOT close when the dialog body is clicked", async () => {
    const onClose = vi.fn();
    render(<Modal title="T" onClose={onClose}>Body</Modal>);
    await userEvent.click(screen.getByText("Body"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("omits the subtitle element when no subtitle is given", () => {
    const { container } = render(<Modal title="T">Body</Modal>);
    expect(container.querySelector(".muted")).toBeNull();
  });
});
