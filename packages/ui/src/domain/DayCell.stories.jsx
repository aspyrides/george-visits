import { DayCell } from "./DayCell.jsx";

export default { title: "Domain/DayCell", component: DayCell };

export const Available = { args: { day: 12, status: "available" } };
export const FillingUp = { args: { day: 13, status: "limited" } };
export const FullyBooked = { args: { day: 14, status: "full" } };
export const Today = { args: { day: 29, status: "available", today: true } };
export const Selected = { args: { day: 29, status: "available", selected: true } };
export const Past = { args: { day: 3, status: "available", past: true } };
