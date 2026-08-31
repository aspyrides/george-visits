import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TextField } from "./TextField.jsx";

describe("TextField", () => {
  it("associates its label with its input", () => {
    render(<TextField id="name" label="Your name" value="" onChange={() => {}} />);
    expect(screen.getByLabelText("Your name")).toBeInTheDocument();
  });
  it("renders no label element when no label is given", () => {
    const { container } = render(<TextField id="pin" value="" onChange={() => {}} />);
    expect(container.querySelector("label")).toBeNull();
  });
  it("shows the current value", () => {
    render(<TextField id="name" label="Your name" value="Maria" onChange={() => {}} />);
    expect(screen.getByLabelText("Your name")).toHaveValue("Maria");
  });
  it("calls onChange as the user types", async () => {
    const onChange = vi.fn();
    render(<TextField id="name" label="Your name" value="" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Your name"), "A");
    expect(onChange).toHaveBeenCalled();
  });
  it("passes through type, placeholder and maxLength", () => {
    render(
      <TextField id="pin" label="Passcode" type="password" placeholder="Passcode" maxLength={40} value="" onChange={() => {}} />
    );
    const input = screen.getByLabelText("Passcode");
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveAttribute("placeholder", "Passcode");
    expect(input).toHaveAttribute("maxLength", "40");
  });
});
