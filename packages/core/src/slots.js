import { pad2, fromISODate } from "./dates.js";

export function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(mins) {
  return `${pad2(Math.floor(mins / 60))}:${pad2(mins % 60)}`;
}

export function generateSlotTimes({ dayStart, dayEnd, slotMinutes }) {
  const start = timeToMinutes(dayStart);
  const end = timeToMinutes(dayEnd);
  const slots = [];
  for (let t = start; t < end; t += slotMinutes) slots.push(minutesToTime(t));
  return slots;
}

export function formatTime12h(t) {
  const [h, m] = t.split(":").map(Number);
  const period = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad2(m)} ${period}`;
}

export function isPastSlot(dateISO, timeStr, now = new Date()) {
  const slotDate = fromISODate(dateISO);
  const [h, m] = timeStr.split(":").map(Number);
  slotDate.setHours(h, m, 0, 0);
  return slotDate.getTime() < now.getTime();
}
