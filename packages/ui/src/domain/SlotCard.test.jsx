import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SlotCard } from "./SlotCard.jsx";

const BASE = { time: "9:00 AM", statusText: "3 of 3 spots open" };

describe("SlotCard", () => {
  it("renders the time and status", () => {
    render(<SlotCard {...BASE} state="open" actionLabel="Book" />);
    expect(screen.getByText("9:00 AM")).toHaveClass("slot-time");
    expect(screen.getByText("3 of 3 spots open")).toHaveClass("slot-status");
  });

  it("open: renders a book button that calls onBook", async () => {
    const onBook = vi.fn();
    render(<SlotCard {...BASE} state="open" actionLabel="Book" onBook={onBook} />);
    const btn = screen.getByRole("button", { name: "Book" });
    expect(btn).toHaveClass("btn-book");
    await userEvent.click(btn);
    expect(onBook).toHaveBeenCalledOnce();
  });

  it("mine: adds the mine class and a cancel button that calls onCancel", async () => {
    const onCancel = vi.fn();
    const { container } = render(
      <SlotCard {...BASE} state="mine" actionLabel="Cancel your visit" onCancel={onCancel} />
    );
    expect(container.firstChild).toHaveClass("slot-card", "mine");
    const btn = screen.getByRole("button", { name: "Cancel your visit" });
    expect(btn).toHaveClass("btn-danger");
    await userEvent.click(btn);
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("full: renders a disabled button", () => {
    render(<SlotCard {...BASE} state="full" statusText="Fully booked" actionLabel="Full" />);
    const btn = screen.getByRole("button", { name: "Full" });
    expect(btn).toBeDisabled();
    expect(btn).toHaveClass("btn-full");
  });

  it("blocked: renders a disabled button carrying the explanatory title", () => {
    render(
      <SlotCard
        {...BASE}
        state="blocked"
        actionLabel="Too long a visit"
        actionTitle="Booking this would make a run of more than 3 consecutive slots for you"
      />
    );
    const btn = screen.getByRole("button", { name: "Too long a visit" });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute(
      "title",
      "Booking this would make a run of more than 3 consecutive slots for you"
    );
  });

  it("past: adds the past class and renders no action button", () => {
    const { container } = render(<SlotCard {...BASE} state="past" statusText="Past" />);
    expect(container.firstChild).toHaveClass("slot-card", "past");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders guests as chips when given", () => {
    const { container } = render(
      <SlotCard {...BASE} state="open" actionLabel="Book" guests={[{ name: "Tom", visitorCount: 1 }]} />
    );
    expect(container.querySelector(".guest-chip")).toBeInTheDocument();
  });

  it("renders no guest container when there are no guests", () => {
    const { container } = render(<SlotCard {...BASE} state="open" actionLabel="Book" />);
    expect(container.querySelector(".slot-guests")).toBeNull();
  });
});
