import { CalendarGrid } from "../domain/CalendarGrid.jsx";
import { LegendBar } from "../domain/LegendBar.jsx";
import { PagerNav } from "../domain/PagerNav.jsx";
import { WeekdayRow } from "../domain/WeekdayRow.jsx";

export function CalendarTab({
  monthLabel,
  onPrevMonth,
  onNextMonth,
  prevMonthAriaLabel,
  nextMonthAriaLabel,
  weekdays = [],
  cells = [],
  onSelectDay,
  legendItems = [],
}) {
  return (
    <div className="tab-panel">
      <PagerNav
        label={monthLabel}
        onPrev={onPrevMonth}
        onNext={onNextMonth}
        prevAriaLabel={prevMonthAriaLabel}
        nextAriaLabel={nextMonthAriaLabel}
      />
      <WeekdayRow days={weekdays} />
      <CalendarGrid cells={cells} onSelectDay={onSelectDay} />
      <LegendBar items={legendItems} />
    </div>
  );
}
