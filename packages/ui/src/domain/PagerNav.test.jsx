import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PagerNav } from "./PagerNav.jsx";

describe("PagerNav", () => {
  it("renders its label as a heading", () => {
    render(<PagerNav label="August 2026" />);
    expect(screen.getByRole("heading", { name: "August 2026" })).toBeInTheDocument();
  });

  it("calls onPrev when the previous button is clicked", async () => {
    const onPrev = vi.fn();
    render(<PagerNav label="August 2026" onPrev={onPrev} />);
    await userEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(onPrev).toHaveBeenCalledOnce();
  });

  it("calls onNext when the next button is clicked", async () => {
    const onNext = vi.fn();
    render(<PagerNav label="August 2026" onNext={onNext} />);
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it("accepts custom aria labels", () => {
    render(<PagerNav label="Saturday" prevAriaLabel="Previous day" nextAriaLabel="Next day" />);
    expect(screen.getByRole("button", { name: "Previous day" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next day" })).toBeInTheDocument();
  });

  it("uses the pager-nav class so month and day navigation share one rule", () => {
    const { container } = render(<PagerNav label="August 2026" />);
    expect(container.firstChild).toHaveClass("pager-nav");
  });
});
