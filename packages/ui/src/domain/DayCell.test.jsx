import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DayCell } from "./DayCell.jsx";

describe("DayCell", () => {
  it("renders the day number", () => {
    render(<DayCell day={29} status="available" />);
    expect(screen.getByText("29")).toBeInTheDocument();
  });

  it("renders a status dot", () => {
    const { container } = render(<DayCell day={29} status="limited" />);
    expect(container.querySelector(".dot.limited")).toBeInTheDocument();
  });

  it("renders an empty placeholder with no content", () => {
    const { container } = render(<DayCell empty />);
    expect(container.firstChild).toHaveClass("day-cell", "empty");
    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it("marks today", () => {
    const { container } = render(<DayCell day={29} status="available" today />);
    expect(container.firstChild).toHaveClass("day-cell", "today");
  });

  it("marks the selected day", () => {
    const { container } = render(<DayCell day={29} status="available" selected />);
    expect(container.firstChild).toHaveClass("day-cell", "selected");
  });

  it("marks past days and hides their dot", () => {
    const { container } = render(<DayCell day={1} status="available" past />);
    expect(container.firstChild).toHaveClass("day-cell", "past");
    expect(container.querySelector(".dot")).toBeNull();
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<DayCell day={29} status="available" onClick={onClick} />);
    await userEvent.click(screen.getByText("29"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not call onClick for a past day", async () => {
    const onClick = vi.fn();
    render(<DayCell day={1} status="available" past onClick={onClick} />);
    await userEvent.click(screen.getByText("1"));
    expect(onClick).not.toHaveBeenCalled();
  });
});
