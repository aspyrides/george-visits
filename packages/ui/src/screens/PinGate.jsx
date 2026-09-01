import { Button } from "../primitives/Button.jsx";
import { Card } from "../primitives/Card.jsx";
import { EmojiHero } from "../primitives/EmojiHero.jsx";
import { FormError } from "../primitives/FormError.jsx";
import { TextField } from "../primitives/TextField.jsx";

export function PinGate({
  emoji,
  title,
  prompt,
  placeholder,
  value,
  onChange,
  onSubmit,
  submitLabel,
  error,
}) {
  return (
    <section className="screen">
      <Card centered>
        <EmojiHero emoji={emoji} />
        <h1>{title}</h1>
        <p className="muted">{prompt}</p>
        <form onSubmit={onSubmit}>
          <TextField
            id="pin-input"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            required
            placeholder={placeholder}
            value={value}
            onChange={onChange}
          />
          <Button type="submit">{submitLabel}</Button>
        </form>
        <FormError>{error}</FormError>
      </Card>
    </section>
  );
}
