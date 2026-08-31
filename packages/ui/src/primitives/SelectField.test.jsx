import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SelectField } from "./SelectField.jsx";

const OPTIONS = [
  { value: "", label: "Prefer not to say" },
  { value: "Auntie", label: "Auntie" },
  { value: "Uncle", label: "Uncle" },
];

describe("SelectField", () => {
  it("associates its label with its select", () => {
    render(<SelectField id="rel" label="Relationship" options={OPTIONS} value="" onChange={() => {}} />);
    expect(screen.getByLabelText("Relationship")).toBeInTheDocument();
  });
  it("renders one option per entry", () => {
    render(<SelectField id="rel" label="Relationship" options={OPTIONS} value="" onChange={() => {}} />);
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });
  it("reflects the selected value", () => {
    render(<SelectField id="rel" label="Relationship" options={OPTIONS} value="Uncle" onChange={() => {}} />);
    expect(screen.getByLabelText("Relationship")).toHaveValue("Uncle");
  });
  it("calls onChange when a different option is picked", async () => {
    const onChange = vi.fn();
    render(<SelectField id="rel" label="Relationship" options={OPTIONS} value="" onChange={onChange} />);
    await userEvent.selectOptions(screen.getByLabelText("Relationship"), "Auntie");
    expect(onChange).toHaveBeenCalled();
  });
});
