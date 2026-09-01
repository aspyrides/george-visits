import { GuestList } from "./GuestList.jsx";

const GUESTS = [
  { name: "Aunt Maria", relationship: "Auntie", visitorCount: 1 },
  { name: "Tom", relationship: "Friend of the family", visitorCount: 3 },
];

export default { title: "Domain/GuestList", component: GuestList };

export const Chips = { args: { guests: GUESTS } };
export const Inline = { args: { guests: GUESTS, variant: "inline", inlinePrefix: "Already booked: " } };
