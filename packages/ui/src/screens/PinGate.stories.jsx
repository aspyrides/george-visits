import { PinGate } from "./PinGate.jsx";

export default {
  title: "Screens/PinGate",
  component: PinGate,
  parameters: { layout: "fullscreen" },
};

const base = {
  emoji: "👶",
  title: "Visit Schedule",
  prompt: "Enter the family passcode to continue.",
  placeholder: "Passcode",
  submitLabel: "Continue",
  value: "",
  onChange: () => {},
  onSubmit: (e) => e.preventDefault(),
};

export const Default = { args: base };
export const WithError = { args: { ...base, error: "That’s not quite right — try again." } };
