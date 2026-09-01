import { SlotCard } from "./SlotCard.jsx";

export default {
  title: "Domain/SlotCard",
  component: SlotCard,
  parameters: { layout: "padded" },
};

export const Open = {
  args: { time: "9:00 AM", statusText: "3 of 3 spots open", state: "open", actionLabel: "Book" },
};
export const PartiallyBooked = {
  args: {
    time: "9:30 AM",
    statusText: "1 of 3 spots open",
    state: "open",
    actionLabel: "Book",
    guests: [{ name: "Aunt Maria", relationship: "Auntie", visitorCount: 2 }],
  },
};
export const Mine = {
  args: {
    time: "10:00 AM",
    statusText: "1 of 3 spots open",
    state: "mine",
    actionLabel: "Cancel your visit",
    guests: [{ name: "You", visitorCount: 2 }],
  },
};
export const FullyBooked = {
  args: {
    time: "10:30 AM",
    statusText: "Fully booked",
    state: "full",
    actionLabel: "Full",
    guests: [{ name: "Grandma", relationship: "Grandmother", visitorCount: 3 }],
  },
};
export const Blocked = {
  args: {
    time: "11:00 AM",
    statusText: "3 of 3 spots open",
    state: "blocked",
    actionLabel: "Too long a visit",
    actionTitle: "Booking this would make a run of more than 3 consecutive slots for you",
  },
};
export const Past = { args: { time: "8:30 AM", statusText: "Past", state: "past" } };
