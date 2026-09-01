import { PagerNav } from "./PagerNav.jsx";

export default { title: "Domain/PagerNav", component: PagerNav };

export const Month = {
  args: { label: "August 2026", prevAriaLabel: "Previous month", nextAriaLabel: "Next month" },
};
export const Day = {
  args: { label: "Saturday, August 29", prevAriaLabel: "Previous day", nextAriaLabel: "Next day" },
};
