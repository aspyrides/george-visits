## Visit George — how to build with this library

A small, warm booking UI for a newborn-visit scheduler. Sage green, blush
accent, warm off-white paper, generous rounding. Quicksand for headings and
buttons, Inter for body text.

### Setup: no provider, no theme wrapper

There is **no** context provider, theme object, or root wrapper. Import the
component and render it. All styling comes from the stylesheet, which the
design environment already loads — components are plain functions of props.

```jsx
import { SlotCard } from "@gv/ui";

<SlotCard time="9:00 AM" statusText="3 of 3 spots open" state="open"
          actionLabel="Book" onBook={handleBook} />
```

### Every component is pure — you supply the data AND the words

Nothing fetches, stores, or validates. Two consequences worth internalising:

- **All user-facing text is a prop.** `SlotCard` takes `actionLabel`, not a
  built-in "Book". `PinGate` takes `error` and validates nothing — it does not
  know the passcode. `AppHeader` takes `profileName` already composed
  ("Aunt Maria · Auntie"). If you want words on screen, pass them.
- **Derive before you render.** Screens take view models, not raw data:
  `CalendarGrid` wants `cells: [{day, status, today, past, selected}]`,
  `DayTab` wants `slots: [{id, time, statusText, state, ...}]`. Compute
  status and state yourself; no component works it out.

### Styling idiom: global CSS classes + custom properties

Not utility classes, not CSS-in-JS, not style props. Each component owns a
semantic class name. For your own layout glue around these components, use
the design tokens:

| Token | Use |
|---|---|
| `--bg` `--card-bg` | page ground / raised surface |
| `--primary` `--primary-dark` | sage green actions, hover |
| `--accent` | blush highlight |
| `--danger` `--danger-dark` | cancel + error |
| `--text` `--muted` | body text / secondary text |
| `--border` | hairline borders |
| `--radius` | 18px card rounding |
| `--shadow` | soft card shadow |

Two helper classes are safe to reuse: `.muted` (secondary text) and
`.hidden`. Everything else belongs to a component — do not hand-write
`.slot-card` markup, render `<SlotCard>`.

```jsx
<div style={{ background: "var(--card-bg)", border: "1.5px solid var(--border)",
              borderRadius: "var(--radius)", boxShadow: "var(--shadow)", padding: 20 }}>
  <h2>This month</h2>
  <CalendarGrid cells={cells} onSelectDay={setDay} />
</div>
```

### Picking a component

- **Primitives** (`Button`, `Card`, `TextField`, `SelectField`, `Modal`,
  `Toast`, `Chip`, `Tabs`, `EmptyState`, `EmojiHero`, `FormError`) — generic
  parts. `Button` variants: `primary`, `link`, `danger`, `book`, `full`
  (`full` is always disabled).
- **Domain** (`SlotCard`, `CalendarGrid`, `DayCell`, `BookingRow`,
  `GuestList`, `StatusDot`, `LegendBar`, `PagerNav`, `WeekdayRow`,
  `AppHeader`) — this app's real vocabulary. Prefer these over rebuilding.
- **Screens** (`CalendarTab`, `DayTab`, `MyBookingsTab`, `BookingModal`,
  `PinGate`, `ProfileSetup`) — whole views, composed from the above.

Two states are easy to miss: `SlotCard`'s `state` has **five** values —
`open`, `mine`, `full`, `blocked`, `past`. `blocked` means a booking rule
forbids it (pass `actionTitle` to explain why); `full` means no capacity.
And `GuestList` has two shapes: `variant="chips"` for slot cards,
`variant="inline"` for prose inside a modal.

### Where the truth is

Read `styles.css` and its imports for the real rules, and each component's
`.d.ts` for its exact props. Those beat this summary.
