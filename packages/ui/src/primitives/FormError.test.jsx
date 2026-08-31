import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormError } from "./FormError.jsx";

describe("FormError", () => {
  it("renders its children with the error class", () => {
    render(<FormError>That’s not quite right — try again.</FormError>);
    expect(screen.getByText("That’s not quite right — try again.")).toHaveClass("error");
  });
  it("renders nothing when it has no children", () => {
    const { container } = render(<FormError />);
    expect(container).toBeEmptyDOMElement();
  });
});
