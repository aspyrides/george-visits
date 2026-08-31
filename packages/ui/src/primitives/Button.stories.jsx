import { Button } from "./Button.jsx";

export default {
  title: "Primitives/Button",
  component: Button,
};

export const Primary = { args: { variant: "primary", children: "Continue" } };
export const PrimaryDisabled = { args: { variant: "primary", children: "Continue", disabled: true } };
export const Link = { args: { variant: "link", children: "Edit" } };
export const Danger = { args: { variant: "danger", children: "Cancel booking" } };
export const Book = { args: { variant: "book", children: "Book" } };
export const Full = { args: { variant: "full", children: "Full" } };
