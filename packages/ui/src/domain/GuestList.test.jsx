import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GuestList } from "./GuestList.jsx";

const GUESTS = [
  { name: "Aunt Maria", relationship: "Auntie", visitorCount: 1 },
  { name: "Tom", relationship: "", visitorCount: 3 },
];

describe("GuestList (chips variant)", () => {
  it("renders one chip per guest", () => {
    const { container } = render(<GuestList guests={GUESTS} />);
    expect(container.querySelectorAll(".guest-chip")).toHaveLength(2);
  });

  it("joins name and relationship with a middot", () => {
    render(<GuestList guests={GUESTS} />);
    expect(screen.getByText("Aunt Maria · Auntie")).toBeInTheDocument();
  });

  it("omits the relationship when there is none", () => {
    render(<GuestList guests={[{ name: "Tom", visitorCount: 1 }]} />);
    expect(screen.getByText("Tom")).toBeInTheDocument();
  });

  it("shows the extra visitor count when a guest brings others", () => {
    render(<GuestList guests={GUESTS} />);
    expect(screen.getByText("Tom (+2)")).toBeInTheDocument();
  });

  it("uses the slot-guests container", () => {
    const { container } = render(<GuestList guests={GUESTS} />);
    expect(container.firstChild).toHaveClass("slot-guests");
  });
});

describe("GuestList (inline variant)", () => {
  it("renders guests as comma-joined text", () => {
    render(<GuestList guests={GUESTS} variant="inline" />);
    expect(screen.getByText("Aunt Maria (Auntie), Tom")).toBeInTheDocument();
  });

  it("renders the prefix before the names", () => {
    render(<GuestList guests={GUESTS} variant="inline" inlinePrefix="Already booked: " />);
    expect(screen.getByText("Already booked: Aunt Maria (Auntie), Tom")).toBeInTheDocument();
  });

  it("uses the modal-guests container", () => {
    const { container } = render(<GuestList guests={GUESTS} variant="inline" />);
    expect(container.firstChild).toHaveClass("modal-guests");
  });
});

describe("GuestList (empty)", () => {
  it("renders nothing when there are no guests", () => {
    const { container } = render(<GuestList guests={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
