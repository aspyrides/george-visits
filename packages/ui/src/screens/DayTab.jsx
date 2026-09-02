import { PagerNav } from "../domain/PagerNav.jsx";
import { SlotCard } from "../domain/SlotCard.jsx";

export function DayTab({
  dayLabel,
  onPrevDay,
  onNextDay,
  prevDayAriaLabel,
  nextDayAriaLabel,
  note,
  slots = [],
}) {
  return (
    <div className="tab-panel">
      <PagerNav
        label={dayLabel}
        onPrev={onPrevDay}
        onNext={onNextDay}
        prevAriaLabel={prevDayAriaLabel}
        nextAriaLabel={nextDayAriaLabel}
      />
      {note && <p className="muted day-note">{note}</p>}
      <div className="slot-list">
        {slots.map(({ id, ...slot }) => (
          <SlotCard key={id} {...slot} />
        ))}
      </div>
    </div>
  );
}
