import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs } from "./Tabs.jsx";

const TABS = [
  { id: "calendar", label: "Calendar" },
  { id: "day", label: "Day view" },
  { id: "mine", label: "My bookings" },
];

describe("Tabs", () => {
  it("renders one button per tab", () => {
    render(<Tabs tabs={TABS} activeId="calendar" onChange={() => {}} />);
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });
  it("marks only the active tab active", () => {
    render(<Tabs tabs={TABS} activeId="day" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Day view" })).toHaveClass("tab-btn", "active");
    expect(screen.getByRole("button", { name: "Calendar" })).not.toHaveClass("active");
  });
  it("calls onChange with the tab id", async () => {
    const onChange = vi.fn();
    render(<Tabs tabs={TABS} activeId="calendar" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "My bookings" }));
    expect(onChange).toHaveBeenCalledWith("mine");
  });
});
