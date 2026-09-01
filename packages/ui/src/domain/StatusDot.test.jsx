import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { StatusDot } from "./StatusDot.jsx";

describe("StatusDot", () => {
  it.each(["available", "limited", "full"])("renders the %s status class", (status) => {
    const { container } = render(<StatusDot status={status} />);
    expect(container.firstChild).toHaveClass("dot", status);
  });

  it("defaults to available", () => {
    const { container } = render(<StatusDot />);
    expect(container.firstChild).toHaveClass("dot", "available");
  });
});
