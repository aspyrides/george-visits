// The exact codes thrown by the booking transaction. The app maps these to
// user-facing copy; the library never owns product wording.
export const BOOKING_ERRORS = Object.freeze({
  FULL: "FULL",
  ALREADY_BOOKED: "ALREADY_BOOKED",
  RUN_LIMIT: "RUN_LIMIT",
});

export function isBookingErrorCode(code) {
  return Object.values(BOOKING_ERRORS).includes(code);
}
