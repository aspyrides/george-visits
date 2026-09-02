import { Button } from "../primitives/Button.jsx";
import { Modal } from "../primitives/Modal.jsx";
import { SelectField } from "../primitives/SelectField.jsx";
import { GuestList } from "../domain/GuestList.jsx";

export function BookingModal({
  title,
  subtitle,
  guests = [],
  guestsPrefix = "",
  visitorLabel,
  visitorOptions = [],
  visitorCount,
  onVisitorCountChange,
  onSubmit,
  submitLabel,
  onClose,
}) {
  return (
    <Modal title={title} subtitle={subtitle} onClose={onClose}>
      <GuestList guests={guests} variant="inline" inlinePrefix={guestsPrefix} />
      <form onSubmit={onSubmit}>
        <SelectField
          id="visitor-count"
          label={visitorLabel}
          options={visitorOptions}
          value={visitorCount}
          onChange={onVisitorCountChange}
        />
        <Button type="submit">{submitLabel}</Button>
      </form>
    </Modal>
  );
}
