import { TextField } from "./TextField.jsx";

export default { title: "Primitives/TextField", component: TextField };

export const WithLabel = {
  args: { id: "name", label: "Your name", placeholder: "e.g. Aunt Maria", value: "", onChange: () => {} },
};
export const Filled = {
  args: { id: "name", label: "Your name", value: "Aunt Maria", onChange: () => {} },
};
export const Passcode = {
  args: { id: "pin", type: "password", placeholder: "Passcode", value: "", onChange: () => {} },
};
