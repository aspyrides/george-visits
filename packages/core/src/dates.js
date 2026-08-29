export const pad2 = (n) => String(n).padStart(2, "0");

export function toISODate(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function fromISODate(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function addMonths(d, n) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

export function isSameDay(a, b) {
  return a.toDateString() === b.toDateString();
}

export function isPastDay(d, now = new Date()) {
  const t = new Date(now);
  t.setHours(0, 0, 0, 0);
  const dd = new Date(d);
  dd.setHours(0, 0, 0, 0);
  return dd < t;
}

export function formatDayLabel(d, locale = undefined) {
  return d.toLocaleDateString(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatDayShort(d, locale = undefined) {
  return d.toLocaleDateString(locale, { month: "short", day: "numeric" });
}
