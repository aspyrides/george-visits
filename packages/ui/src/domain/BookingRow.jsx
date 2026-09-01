import { Button } from "../primitives/Button.jsx";

export function BookingRow({
  dateLabel,
  atLabel,
  timeLabel,
  visitorsLabel,
  past = false,
  cancelLabel,
  onCancel,
}) {
  return (
    <div className={past ? "booking-row past" : "booking-row"}>
      <div>
        <strong>{dateLabel}</strong> {atLabel} {timeLabel}
        {visitorsLabel && <div className="muted">{visitorsLabel}</div>}
      </div>
      {!past && onCancel && (
        <Button variant="danger" onClick={onCancel}>
          {cancelLabel}
        </Button>
      )}
    </div>
  );
}
