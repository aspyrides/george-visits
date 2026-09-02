import { BookingModal } from "./BookingModal.jsx";

export default {
  title: "Screens/BookingModal",
  component: BookingModal,
  parameters: { layout: "fullscreen" },
};

const base = {
  title: "Book this slot",
  subtitle: "Saturday, August 29 at 9:00 AM",
  visitorLabel: "Number of visitors (incl. you)",
  visitorOptions: [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
  ],
  visitorCount: "1",
  onVisitorCountChange: () => {},
  submitLabel: "Confirm booking",
  onSubmit: (e) => e.preventDefault(),
  onClose: () => {},
};

export const EmptySlot = { args: base };
export const PartiallyBooked = {
  args: {
    ...base,
    subtitle: "Saturday, August 29 at 9:30 AM",
    guests: [{ name: "Aunt Maria", relationship: "Auntie" }],
    guestsPrefix: "Already booked: ",
    visitorOptions: [{ value: "1", label: "1" }],
  },
};
