export function Card({ centered = false, children, className = "" }) {
  const classes = ["card", centered && "centered", className].filter(Boolean).join(" ");
  return <div className={classes}>{children}</div>;
}
