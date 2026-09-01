import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MyBookingsTab } from "./MyBookingsTab.jsx";

const BOOKINGS = [
  { id: "2026-08-30_09:00", dateLabel: "Aug 30", atLabel: "at", timeLabel: "9:00 AM", cancelLabel: "Cancel" },
  { id: "2026-08-31_14:00", dateLabel: "Aug 31", atLabel: "at", timeLabel: "2:00 PM", cancelLabel: "Cancel" },
];

describe("MyBookingsTab", () => {
  it("renders the heading", () => {
    render(<MyBookingsTab heading="Your booked visits" bookings={BOOKINGS} />);
    expect(screen.getByRole("heading", { name: "Your booked visits" })).toBeInTheDocument();
  });

  it("renders one row per booking", () => {
    const { container } = render(<MyBookingsTab heading="Your booked visits" bookings={BOOKINGS} />);
    expect(container.querySelectorAll(".booking-row")).toHaveLength(2);
  });

  it("shows the empty state when there are no bookings", () => {
    render(
      <MyBookingsTab heading="Your booked visits" bookings={[]} emptyMessage="You haven’t booked a visit yet." />
    );
    expect(screen.getByText("You haven’t booked a visit yet.")).toHaveClass("empty-state");
  });

  it("calls a booking's own onCancel handler", async () => {
    const onCancel = vi.fn();
    render(
      <MyBookingsTab heading="Your booked visits" bookings={[{ ...BOOKINGS[0], onCancel }]} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
