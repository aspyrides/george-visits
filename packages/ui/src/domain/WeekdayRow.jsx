export function WeekdayRow({ days = [] }) {
  return (
    <div className="weekday-row">
      {days.map((day, i) => (
        <span key={i}>{day}</span>
      ))}
    </div>
  );
}
