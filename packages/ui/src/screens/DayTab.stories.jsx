import { DayTab } from "./DayTab.jsx";

export default {
  title: "Screens/DayTab",
  component: DayTab,
  parameters: { layout: "padded" },
};

export const MixedDay = {
  args: {
    dayLabel: "Saturday, August 29",
    prevDayAriaLabel: "Previous day",
    nextDayAriaLabel: "Next day",
    onPrevDay: () => {},
    onNextDay: () => {},
    note: "Each visit can be up to 3 consecutive slots (1.5 hrs) long.",
    slots: [
      { id: "08:30", time: "8:30 AM", statusText: "Past", state: "past" },
      { id: "09:00", time: "9:00 AM", statusText: "3 of 3 spots open", state: "open", actionLabel: "Book", onBook: () => {} },
      {
        id: "09:30",
        time: "9:30 AM",
        statusText: "1 of 3 spots open",
        state: "open",
        actionLabel: "Book",
        onBook: () => {},
        guests: [{ name: "Aunt Maria", relationship: "Auntie", visitorCount: 2 }],
      },
      {
        id: "10:00",
        time: "10:00 AM",
        statusText: "1 of 3 spots open",
        state: "mine",
        actionLabel: "Cancel your visit",
        onCancel: () => {},
        guests: [{ name: "You", visitorCount: 2 }],
      },
      {
        id: "10:30",
        time: "10:30 AM",
        statusText: "Fully booked",
        state: "full",
        actionLabel: "Full",
        guests: [{ name: "Grandma", relationship: "Grandmother", visitorCount: 3 }],
      },
      {
        id: "11:00",
        time: "11:00 AM",
        statusText: "3 of 3 spots open",
        state: "blocked",
        actionLabel: "Too long a visit",
        actionTitle: "Booking this would make a run of more than 3 consecutive slots for you",
      },
    ],
  },
};
