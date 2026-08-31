import { SelectField } from "./SelectField.jsx";

const OPTIONS = [
  { value: "", label: "Prefer not to say" },
  { value: "Grandmother", label: "Grandmother" },
  { value: "Auntie", label: "Auntie" },
  { value: "Friend of the family", label: "Friend of the family" },
];

export default { title: "Primitives/SelectField", component: SelectField };

export const Default = {
  args: { id: "rel", label: "Relationship to baby (optional)", options: OPTIONS, value: "", onChange: () => {} },
};
export const Selected = {
  args: { id: "rel", label: "Relationship to baby (optional)", options: OPTIONS, value: "Auntie", onChange: () => {} },
};
