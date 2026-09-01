import { DayCell } from "./DayCell.jsx";

export function CalendarGrid({ cells = [], onSelectDay }) {
  return (
    <div className="calendar-grid">
      {cells.map((cell, i) =>
        cell.empty ? (
          <DayCell key={`empty-${i}`} empty />
        ) : (
          <DayCell key={`day-${cell.day}`} {...cell} onClick={() => onSelectDay?.(cell.day)} />
        )
      )}
    </div>
  );
}
