import { LegendBar } from "./LegendBar.jsx";

export default { title: "Domain/LegendBar", component: LegendBar };

export const Default = {
  args: {
    items: [
      { status: "available", label: "Open" },
      { status: "limited", label: "Filling up" },
      { status: "full", label: "Fully booked" },
    ],
  },
};
