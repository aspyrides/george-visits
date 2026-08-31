export function TextField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  maxLength,
  required = false,
  inputMode,
  autoComplete,
}) {
  return (
    <>
      {label && <label htmlFor={id}>{label}</label>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        inputMode={inputMode}
        autoComplete={autoComplete}
      />
    </>
  );
}
