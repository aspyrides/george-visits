import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DayTab } from "./DayTab.jsx";

const BASE = {
  dayLabel: "Saturday, August 29",
  prevDayAriaLabel: "Previous day",
  nextDayAriaLabel: "Next day",
  slots: [
    { id: "08:30", time: "8:30 AM", statusText: "Past", state: "past" },
    { id: "09:00", time: "9:00 AM", statusText: "3 of 3 spots open", state: "open", actionLabel: "Book" },
    { id: "09:30", time: "9:30 AM", statusText: "Fully booked", state: "full", actionLabel: "Full" },
  ],
};

describe("DayTab", () => {
  it("renders the day label", () => {
    render(<DayTab {...BASE} />);
    expect(screen.getByRole("heading", { name: "Saturday, August 29" })).toBeInTheDocument();
  });

  it("calls onPrevDay and onNextDay", async () => {
    const onPrevDay = vi.fn();
    const onNextDay = vi.fn();
    render(<DayTab {...BASE} onPrevDay={onPrevDay} onNextDay={onNextDay} />);
    await userEvent.click(screen.getByRole("button", { name: "Previous day" }));
    await userEvent.click(screen.getByRole("button", { name: "Next day" }));
    expect(onPrevDay).toHaveBeenCalledOnce();
    expect(onNextDay).toHaveBeenCalledOnce();
  });

  it("renders the note when given", () => {
    render(<DayTab {...BASE} note="Each visit can be up to 3 consecutive slots (1.5 hrs) long." />);
    expect(
      screen.getByText("Each visit can be up to 3 consecutive slots (1.5 hrs) long.")
    ).toHaveClass("day-note");
  });

  it("renders no note element when there is no note", () => {
    const { container } = render(<DayTab {...BASE} />);
    expect(container.querySelector(".day-note")).toBeNull();
  });

  it("renders one slot card per slot", () => {
    const { container } = render(<DayTab {...BASE} />);
    expect(container.querySelectorAll(".slot-card")).toHaveLength(3);
  });

  it("wraps the slots in a slot-list", () => {
    const { container } = render(<DayTab {...BASE} />);
    expect(container.querySelector(".slot-list")).toBeInTheDocument();
  });

  it("calls a slot's own onBook handler", async () => {
    const onBook = vi.fn();
    const slots = [{ ...BASE.slots[1], onBook }];
    render(<DayTab {...BASE} slots={slots} />);
    await userEvent.click(screen.getByRole("button", { name: "Book" }));
    expect(onBook).toHaveBeenCalledOnce();
  });
});
