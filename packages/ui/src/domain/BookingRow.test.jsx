import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BookingRow } from "./BookingRow.jsx";

const BASE = { dateLabel: "Aug 29", atLabel: "at", timeLabel: "9:00 AM" };

describe("BookingRow", () => {
  it("renders the date in bold and the time", () => {
    render(<BookingRow {...BASE} cancelLabel="Cancel" onCancel={() => {}} />);
    expect(screen.getByText("Aug 29").tagName).toBe("STRONG");
    expect(screen.getByText(/9:00 AM/)).toBeInTheDocument();
  });

  it("shows the visitor count line when given", () => {
    render(<BookingRow {...BASE} visitorsLabel="3 visitors" cancelLabel="Cancel" onCancel={() => {}} />);
    expect(screen.getByText("3 visitors")).toHaveClass("muted");
  });

  it("omits the visitor count line when not given", () => {
    const { container } = render(<BookingRow {...BASE} cancelLabel="Cancel" onCancel={() => {}} />);
    expect(container.querySelector(".muted")).toBeNull();
  });

  it("calls onCancel when the cancel button is clicked", async () => {
    const onCancel = vi.fn();
    render(<BookingRow {...BASE} cancelLabel="Cancel" onCancel={onCancel} />);
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("past: adds the past class and renders no cancel button", () => {
    const { container } = render(<BookingRow {...BASE} past cancelLabel="Cancel" onCancel={() => {}} />);
    expect(container.firstChild).toHaveClass("booking-row", "past");
    expect(screen.queryByRole("button")).toBeNull();
  });
});
