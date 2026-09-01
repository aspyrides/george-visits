import { Button } from "../primitives/Button.jsx";
import { Card } from "../primitives/Card.jsx";
import { EmojiHero } from "../primitives/EmojiHero.jsx";
import { SelectField } from "../primitives/SelectField.jsx";
import { TextField } from "../primitives/TextField.jsx";

export function ProfileSetup({
  emoji,
  heading,
  subtitle,
  nameLabel,
  namePlaceholder,
  name,
  onNameChange,
  relationshipLabel,
  relationshipOptions = [],
  relationship,
  onRelationshipChange,
  onSubmit,
  submitLabel,
  cancelLabel,
  onCancel,
}) {
  return (
    <section className="screen">
      <Card centered>
        <EmojiHero emoji={emoji} />
        <h1>{heading}</h1>
        <p className="muted">{subtitle}</p>
        <form onSubmit={onSubmit}>
          <TextField
            id="profile-name"
            label={nameLabel}
            placeholder={namePlaceholder}
            required
            maxLength={40}
            value={name}
            onChange={onNameChange}
          />
          <SelectField
            id="profile-relationship"
            label={relationshipLabel}
            options={relationshipOptions}
            value={relationship}
            onChange={onRelationshipChange}
          />
          <Button type="submit">{submitLabel}</Button>
          {onCancel && (
            <Button variant="link" onClick={onCancel}>
              {cancelLabel}
            </Button>
          )}
        </form>
      </Card>
    </section>
  );
}
