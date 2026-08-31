import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button.jsx";

describe("Button", () => {
  it("renders its children", () => {
    render(<Button>Continue</Button>);
    expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument();
  });

  it("defaults to the primary variant", () => {
    render(<Button>Continue</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-primary");
  });

  it.each([
    ["primary", "btn-primary"],
    ["link", "btn-link"],
    ["danger", "btn-danger"],
    ["book", "btn-book"],
    ["full", "btn-full"],
  ])("maps variant %s to class %s", (variant, className) => {
    render(<Button variant={variant}>Label</Button>);
    expect(screen.getByRole("button")).toHaveClass(className);
  });

  it("defaults to type=button so it never submits a form by accident", () => {
    render(<Button>Label</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("accepts type=submit", () => {
    render(<Button type="submit">Confirm</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Label</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not call onClick when disabled", async () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Label</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("forwards arbitrary attributes such as aria-label", () => {
    render(<Button aria-label="Close">×</Button>);
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });
});
