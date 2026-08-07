// Everything in this file is safe to tweak without touching any other file.

export const CONFIG = {
  // Shown in the header and on the passcode screen.
  appTitle: "Visit George",

  // Shared passcode you text/WhatsApp to family & friends. This is a light
  // deterrent, not real security — this repo (and therefore this value) is
  // public. Don't reuse a password you use anywhere else.
  appPin: "2707",

  // Max people allowed in the room at the same time.
  slotCapacity: 3,

  // Longest unbroken run of back-to-back half-hour slots any one person
  // (device) may hold in a single day, e.g. 3 slots = 1.5 hours straight.
  // A person can still have multiple separate blocks the same day (say a
  // morning visit and an evening visit) — this only caps each block.
  maxConsecutiveSlots: 3,

  // Visiting hours. Slots are generated in `slotMinutes` increments between
  // these two times. Wind-down for the baby begins at dayEnd.
  dayStart: "08:30",
  dayEnd: "18:30",
  slotMinutes: 30,

  // Options shown in the "relationship to baby" dropdown. Feel free to
  // add/remove/reorder — order here is the order shown in the app.
  relationshipOptions: [
    "Grandmother",
    "Grandfather",
    "Auntie",
    "Uncle",
    "Cousin",
    "Sibling",
    "Godparent",
    "Friend of the family",
    "Neighbor",
    "Other",
  ],
};
