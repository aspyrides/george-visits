const VARIANT_CLASS = {
  primary: "btn-primary",
  link: "btn-link",
  danger: "btn-danger",
  book: "btn-book",
  full: "btn-full",
};

export function Button({
  variant = "primary",
  type = "button",
  disabled = false,
  onClick,
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      className={VARIANT_CLASS[variant]}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}
