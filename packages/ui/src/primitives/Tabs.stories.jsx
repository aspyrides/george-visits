import { Tabs } from "./Tabs.jsx";

const TABS = [
  { id: "calendar", label: "Calendar" },
  { id: "day", label: "Day view" },
  { id: "mine", label: "My bookings" },
];

export default { title: "Primitives/Tabs", component: Tabs };

export const CalendarActive = { args: { tabs: TABS, activeId: "calendar", onChange: () => {} } };
export const MyBookingsActive = { args: { tabs: TABS, activeId: "mine", onChange: () => {} } };
