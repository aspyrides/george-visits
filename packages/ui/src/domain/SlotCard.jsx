import { Button } from "../primitives/Button.jsx";
import { GuestList } from "./GuestList.jsx";

export function SlotCard({
  time,
  statusText,
  guests = [],
  state = "open",
  actionLabel,
  actionTitle,
  onBook,
  onCancel,
}) {
  const classes = ["slot-card", state === "past" && "past", state === "mine" && "mine"]
    .filter(Boolean)
    .join(" ");

  let action = null;
  if (state === "mine") {
    action = (
      <Button variant="danger" onClick={onCancel}>
        {actionLabel}
      </Button>
    );
  } else if (state === "full" || state === "blocked") {
    action = (
      <Button variant="full" disabled title={actionTitle}>
        {actionLabel}
      </Button>
    );
  } else if (state === "open") {
    action = (
      <Button variant="book" onClick={onBook}>
        {actionLabel}
      </Button>
    );
  }

  return (
    <div className={classes}>
      <div className="slot-time">{time}</div>
      <div className="slot-info">
        <div className="slot-status">{statusText}</div>
        <GuestList guests={guests} />
      </div>
      <div className="slot-action">{action}</div>
    </div>
  );
}
