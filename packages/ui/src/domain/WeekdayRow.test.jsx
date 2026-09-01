import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { WeekdayRow } from "./WeekdayRow.jsx";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

describe("WeekdayRow", () => {
  it("renders one cell per day", () => {
    const { container } = render(<WeekdayRow days={DAYS} />);
    expect(container.querySelectorAll(".weekday-row > span")).toHaveLength(7);
  });

  it("renders the days in the order given", () => {
    const { container } = render(<WeekdayRow days={DAYS} />);
    const text = [...container.querySelectorAll(".weekday-row > span")].map((s) => s.textContent);
    expect(text).toEqual(DAYS);
  });
});
