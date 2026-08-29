import { timeToMinutes } from "./slots.js";

// Length of the unbroken run of back-to-back slot times (in `sortedTimes`)
// that contains `time`, where "back-to-back" means exactly slotMinutes apart.
export function runLengthAt(sortedTimes, time, slotMinutes) {
  const idx = sortedTimes.indexOf(time);
  if (idx === -1) return 0;

  let start = idx;
  while (
    start > 0 &&
    timeToMinutes(sortedTimes[start]) - timeToMinutes(sortedTimes[start - 1]) === slotMinutes
  ) {
    start--;
  }

  let end = idx;
  while (
    end < sortedTimes.length - 1 &&
    timeToMinutes(sortedTimes[end + 1]) - timeToMinutes(sortedTimes[end]) === slotMinutes
  ) {
    end++;
  }

  return end - start + 1;
}

// A person can hold multiple separate blocks of slots on the same day, but
// no single unbroken block may exceed maxConsecutiveSlots.
export function checkConsecutiveRule(existingTimesSorted, time, { slotMinutes, maxConsecutiveSlots }) {
  if (existingTimesSorted.includes(time)) {
    return { allowed: false, reason: "ALREADY_BOOKED" };
  }
  const merged = [...existingTimesSorted, time].sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
  if (runLengthAt(merged, time, slotMinutes) > maxConsecutiveSlots) {
    return { allowed: false, reason: "RUN_LIMIT" };
  }
  return { allowed: true };
}
