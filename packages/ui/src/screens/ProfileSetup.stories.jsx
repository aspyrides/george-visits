import { ProfileSetup } from "./ProfileSetup.jsx";

const OPTIONS = [
  { value: "", label: "Prefer not to say" },
  { value: "Grandmother", label: "Grandmother" },
  { value: "Auntie", label: "Auntie" },
  { value: "Friend of the family", label: "Friend of the family" },
];

export default {
  title: "Screens/ProfileSetup",
  component: ProfileSetup,
  parameters: { layout: "fullscreen" },
};

const base = {
  emoji: "💐",
  heading: "Who's visiting?",
  subtitle: "So everyone can see who's booked a slot.",
  nameLabel: "Your name",
  namePlaceholder: "e.g. Aunt Maria",
  name: "",
  onNameChange: () => {},
  relationshipLabel: "Relationship to baby (optional)",
  relationshipOptions: OPTIONS,
  relationship: "",
  onRelationshipChange: () => {},
  submitLabel: "Continue",
  onSubmit: (e) => e.preventDefault(),
};

export const FirstTime = { args: base };
export const Editing = {
  args: { ...base, name: "Aunt Maria", relationship: "Auntie", cancelLabel: "Cancel", onCancel: () => {} },
};
