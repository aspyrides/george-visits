import { StatusDot } from "./StatusDot.jsx";

export function LegendBar({ items = [] }) {
  return (
    <div className="legend">
      {items.map((item) => (
        <span key={item.status}>
          <StatusDot status={item.status} /> {item.label}
        </span>
      ))}
    </div>
  );
}
