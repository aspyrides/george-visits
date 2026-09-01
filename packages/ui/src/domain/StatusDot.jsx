export function StatusDot({ status = "available" }) {
  return <i className={`dot ${status}`} />;
}
