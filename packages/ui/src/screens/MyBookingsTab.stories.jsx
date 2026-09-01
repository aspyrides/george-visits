import { MyBookingsTab } from "./MyBookingsTab.jsx";

export default {
  title: "Screens/MyBookingsTab",
  component: MyBookingsTab,
  parameters: { layout: "padded" },
};

export const WithBookings = {
  args: {
    heading: "Your booked visits",
    bookings: [
      { id: "a", dateLabel: "Aug 30", atLabel: "at", timeLabel: "9:00 AM", cancelLabel: "Cancel", onCancel: () => {} },
      {
        id: "b",
        dateLabel: "Aug 31",
        atLabel: "at",
        timeLabel: "2:00 PM",
        visitorsLabel: "3 visitors",
        cancelLabel: "Cancel",
        onCancel: () => {},
      },
      { id: "c", dateLabel: "Aug 24", atLabel: "at", timeLabel: "11:00 AM", past: true, cancelLabel: "Cancel" },
    ],
  },
};

export const Empty = {
  args: { heading: "Your booked visits", bookings: [], emptyMessage: "You haven’t booked a visit yet." },
};
