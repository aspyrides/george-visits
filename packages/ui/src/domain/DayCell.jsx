import { StatusDot } from "./StatusDot.jsx";

export function DayCell({
  day,
  status,
  today = false,
  past = false,
  selected = false,
  empty = false,
  onClick,
}) {
  if (empty) return <div className="day-cell empty" />;

  const classes = ["day-cell", today && "today", selected && "selected", past && "past"]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} onClick={past ? undefined : onClick}>
      <span>{day}</span>
      {!past && status && <StatusDot status={status} />}
    </div>
  );
}
