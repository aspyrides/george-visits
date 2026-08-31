export function Toast({ message, tone = "default" }) {
  if (!message) return null;
  return <div className={tone === "error" ? "toast error" : "toast"}>{message}</div>;
}
