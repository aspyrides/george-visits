import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CalendarGrid } from "./CalendarGrid.jsx";

const CELLS = [
  { empty: true },
  { empty: true },
  { day: 1, status: "available" },
  { day: 2, status: "limited", today: true },
  { day: 3, status: "full", selected: true },
];

describe("CalendarGrid", () => {
  it("renders one cell per entry, leading blanks included", () => {
    const { container } = render(<CalendarGrid cells={CELLS} />);
    expect(container.querySelectorAll(".day-cell")).toHaveLength(5);
  });

  it("renders the leading blanks as empty cells", () => {
    const { container } = render(<CalendarGrid cells={CELLS} />);
    expect(container.querySelectorAll(".day-cell.empty")).toHaveLength(2);
  });

  it("calls onSelectDay with the day number", async () => {
    const onSelectDay = vi.fn();
    render(<CalendarGrid cells={CELLS} onSelectDay={onSelectDay} />);
    await userEvent.click(screen.getByText("1"));
    expect(onSelectDay).toHaveBeenCalledWith(1);
  });

  it("renders nothing but the grid when given no cells", () => {
    const { container } = render(<CalendarGrid cells={[]} />);
    expect(container.firstChild).toHaveClass("calendar-grid");
    expect(container.querySelectorAll(".day-cell")).toHaveLength(0);
  });
});
