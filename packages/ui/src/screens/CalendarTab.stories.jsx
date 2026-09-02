import { CalendarTab } from "./CalendarTab.jsx";

const CELLS = [
  ...Array.from({ length: 6 }, () => ({ empty: true })),
  ...Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    const status = day % 7 === 0 ? "full" : day % 3 === 0 ? "limited" : "available";
    return { day, status, past: day < 29, today: day === 29, selected: day === 29 };
  }),
];

export default {
  title: "Screens/CalendarTab",
  component: CalendarTab,
  parameters: { layout: "padded" },
};

export const August = {
  args: {
    monthLabel: "August 2026",
    prevMonthAriaLabel: "Previous month",
    nextMonthAriaLabel: "Next month",
    weekdays: ["S", "M", "T", "W", "T", "F", "S"],
    cells: CELLS,
    onSelectDay: () => {},
    onPrevMonth: () => {},
    onNextMonth: () => {},
    legendItems: [
      { status: "available", label: "Open" },
      { status: "limited", label: "Filling up" },
      { status: "full", label: "Fully booked" },
    ],
  },
};
