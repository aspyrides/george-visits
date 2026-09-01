import { EmptyState } from "../primitives/EmptyState.jsx";
import { BookingRow } from "../domain/BookingRow.jsx";

export function MyBookingsTab({ heading, bookings = [], emptyMessage }) {
  return (
    <div className="tab-panel">
      <h2>{heading}</h2>
      {bookings.length === 0 ? (
        <EmptyState>{emptyMessage}</EmptyState>
      ) : (
        bookings.map(({ id, ...row }) => <BookingRow key={id} {...row} />)
      )}
    </div>
  );
}
