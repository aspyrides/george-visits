import { CalendarGrid } from "./CalendarGrid.jsx";

const AUGUST = [
  ...Array.from({ length: 6 }, () => ({ empty: true })),
  ...Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    const status = day % 7 === 0 ? "full" : day % 3 === 0 ? "limited" : "available";
    return { day, status, past: day < 29, today: day === 29, selected: day === 29 };
  }),
];

export default {
  title: "Domain/CalendarGrid",
  component: CalendarGrid,
  parameters: { layout: "padded" },
};

export const AugustMonth = { args: { cells: AUGUST, onSelectDay: () => {} } };
