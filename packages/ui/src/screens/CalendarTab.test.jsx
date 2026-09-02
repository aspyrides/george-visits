import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CalendarTab } from "./CalendarTab.jsx";

const BASE = {
  monthLabel: "August 2026",
  prevMonthAriaLabel: "Previous month",
  nextMonthAriaLabel: "Next month",
  weekdays: ["S", "M", "T", "W", "T", "F", "S"],
  cells: [{ empty: true }, { day: 1, status: "available" }, { day: 2, status: "full" }],
  legendItems: [
    { status: "available", label: "Open" },
    { status: "full", label: "Fully booked" },
  ],
};

describe("CalendarTab", () => {
  it("renders the month label", () => {
    render(<CalendarTab {...BASE} />);
    expect(screen.getByRole("heading", { name: "August 2026" })).toBeInTheDocument();
  });

  it("calls onPrevMonth and onNextMonth", async () => {
    const onPrevMonth = vi.fn();
    const onNextMonth = vi.fn();
    render(<CalendarTab {...BASE} onPrevMonth={onPrevMonth} onNextMonth={onNextMonth} />);
    await userEvent.click(screen.getByRole("button", { name: "Previous month" }));
    await userEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(onPrevMonth).toHaveBeenCalledOnce();
    expect(onNextMonth).toHaveBeenCalledOnce();
  });

  it("renders the weekday row", () => {
    const { container } = render(<CalendarTab {...BASE} />);
    expect(container.querySelectorAll(".weekday-row > span")).toHaveLength(7);
  });

  it("renders the calendar grid cells", () => {
    const { container } = render(<CalendarTab {...BASE} />);
    expect(container.querySelectorAll(".day-cell")).toHaveLength(3);
  });

  it("renders the legend", () => {
    const { container } = render(<CalendarTab {...BASE} />);
    expect(container.querySelectorAll(".legend > span")).toHaveLength(2);
  });

  it("calls onSelectDay with the day number", async () => {
    const onSelectDay = vi.fn();
    render(<CalendarTab {...BASE} onSelectDay={onSelectDay} />);
    await userEvent.click(screen.getByText("1"));
    expect(onSelectDay).toHaveBeenCalledWith(1);
  });
});
