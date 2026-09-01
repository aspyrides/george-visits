import { Chip } from "../primitives/Chip.jsx";

function chipLabel({ name, relationship, visitorCount = 1 }) {
  const rel = relationship ? ` · ${relationship}` : "";
  const extra = visitorCount > 1 ? ` (+${visitorCount - 1})` : "";
  return `${name}${rel}${extra}`;
}

function inlineLabel({ name, relationship }) {
  return relationship ? `${name} (${relationship})` : name;
}

export function GuestList({ guests = [], variant = "chips", inlinePrefix = "" }) {
  if (!guests.length) return null;

  if (variant === "inline") {
    return (
      <div className="modal-guests">
        {inlinePrefix}
        {guests.map(inlineLabel).join(", ")}
      </div>
    );
  }

  return (
    <div className="slot-guests">
      {guests.map((guest, i) => (
        <Chip key={i}>{chipLabel(guest)}</Chip>
      ))}
    </div>
  );
}
