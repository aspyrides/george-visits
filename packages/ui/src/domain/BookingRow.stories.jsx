import { BookingRow } from "./BookingRow.jsx";

export default {
  title: "Domain/BookingRow",
  component: BookingRow,
  parameters: { layout: "padded" },
};

export const Upcoming = {
  args: { dateLabel: "Aug 30", atLabel: "at", timeLabel: "9:00 AM", cancelLabel: "Cancel", onCancel: () => {} },
};
export const WithExtraVisitors = {
  args: {
    dateLabel: "Aug 30",
    atLabel: "at",
    timeLabel: "9:00 AM",
    visitorsLabel: "3 visitors",
    cancelLabel: "Cancel",
    onCancel: () => {},
  },
};
export const Past = {
  args: { dateLabel: "Aug 24", atLabel: "at", timeLabel: "2:00 PM", past: true, cancelLabel: "Cancel", onCancel: () => {} },
};
