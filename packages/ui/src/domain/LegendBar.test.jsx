import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LegendBar } from "./LegendBar.jsx";

const ITEMS = [
  { status: "available", label: "Open" },
  { status: "limited", label: "Filling up" },
  { status: "full", label: "Fully booked" },
];

describe("LegendBar", () => {
  it("renders one entry per item", () => {
    const { container } = render(<LegendBar items={ITEMS} />);
    expect(container.querySelectorAll(".legend > span")).toHaveLength(3);
  });

  it("renders each label", () => {
    render(<LegendBar items={ITEMS} />);
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("Filling up")).toBeInTheDocument();
    expect(screen.getByText("Fully booked")).toBeInTheDocument();
  });

  it("renders a dot with the matching status for each item", () => {
    const { container } = render(<LegendBar items={ITEMS} />);
    expect(container.querySelector(".dot.available")).toBeInTheDocument();
    expect(container.querySelector(".dot.limited")).toBeInTheDocument();
    expect(container.querySelector(".dot.full")).toBeInTheDocument();
  });

  it("renders an empty legend when given no items", () => {
    const { container } = render(<LegendBar items={[]} />);
    expect(container.querySelectorAll(".legend > span")).toHaveLength(0);
  });
});
