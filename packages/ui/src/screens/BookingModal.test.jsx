import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BookingModal } from "./BookingModal.jsx";

const BASE = {
  title: "Book this slot",
  subtitle: "Saturday, August 29 at 9:00 AM",
  visitorLabel: "Number of visitors (incl. you)",
  visitorOptions: [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
  ],
  visitorCount: "1",
  onVisitorCountChange: () => {},
  submitLabel: "Confirm booking",
  onClose: () => {},
};

describe("BookingModal", () => {
  it("renders the title and subtitle", () => {
    render(<BookingModal {...BASE} />);
    expect(screen.getByRole("heading", { name: "Book this slot" })).toBeInTheDocument();
    expect(screen.getByText("Saturday, August 29 at 9:00 AM")).toBeInTheDocument();
  });

  it("renders existing guests as inline text behind the prefix", () => {
    render(
      <BookingModal
        {...BASE}
        guests={[{ name: "Aunt Maria", relationship: "Auntie" }]}
        guestsPrefix="Already booked: "
      />
    );
    expect(screen.getByText("Already booked: Aunt Maria (Auntie)")).toBeInTheDocument();
  });

  it("renders no guest line when the slot is empty", () => {
    const { container } = render(<BookingModal {...BASE} guests={[]} />);
    expect(container.querySelector(".modal-guests")).toBeNull();
  });

  it("renders one option per visitor count", () => {
    render(<BookingModal {...BASE} />);
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("calls onSubmit when the form is submitted", async () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(<BookingModal {...BASE} onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("button", { name: "Confirm booking" }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("calls onClose from the close button", async () => {
    const onClose = vi.fn();
    render(<BookingModal {...BASE} onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
