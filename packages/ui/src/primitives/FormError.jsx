export function FormError({ children }) {
  if (!children) return null;
  return <p className="error">{children}</p>;
}
