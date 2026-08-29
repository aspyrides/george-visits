# Design system extraction — george-visits

**Date:** 2026-08-29
**Branch:** `design-system`
**Status:** Approved design, pending implementation plan

## Goal

Extract a React component library from the existing static app so that:

1. The app itself renders through the library (single source of truth, no drift).
2. The library can be synced to claude.ai/design via `/design-sync`, so the
   design agent builds new screens out of this app's real components.

## Context

Today the app is build-free static files on GitHub Pages: `index.html`,
`css/style.css`, `js/app.js` (653 lines), `js/config.js`,
`js/firebase-init.js`. Rendering is imperative — render functions build DOM
with `innerHTML` template strings and read module-global Firebase state
directly. There is no component abstraction; the visual vocabulary exists only
as CSS class names.

Decisions taken during brainstorming:

- The app consumes the library (not a design-time-only artifact).
- React, with a build step, on a dedicated branch.
- Library covers primitives, domain components, and full screens.
- npm workspaces monorepo, for a structurally enforced dependency boundary.
- Storybook included, for higher-fidelity design-sync preview verification.

## Constraints

**C1. Components render from props alone.** No component in `packages/ui` may
import Firebase or read live data. The design agent has no access to the
Firestore project; a component that reads live data renders broken in every
design built with it. Enforced structurally: `packages/ui/package.json` does
not list `firebase`, so such an import fails to resolve at build time.

**C2. The passcode must not enter the library.** `js/config.js` holds
`appPin: "2707"` alongside genuinely presentational settings. `CONFIG` stays in
`packages/app`. `PinGate` accepts `onSubmit` and error state as props and
validates nothing itself. A mechanical gate (below) enforces this before upload.

**C3. Behavior preservation.** This is a port, not a redesign. The Firestore
transaction semantics, the consecutive-slot rule, capacity enforcement, and
uid-based cancellation are preserved exactly.

**C4. `main` stays deployable throughout.** The live site is served from `main`
until the branch is merged and Pages is switched to GitHub Actions.

## Architecture

```
george-visits/
├── package.json                 workspaces: ["packages/*"]
├── packages/
│   ├── core/                    pure logic — no React, no DOM, no Firebase
│   │   └── src/{dates,slots,rules,errors}.js  + tests
│   ├── ui/                      React component library ← design-sync target
│   │   ├── src/styles/{tokens,components}.css
│   │   ├── src/{primitives,domain,screens}/*.jsx
│   │   ├── .storybook/
│   │   └── dist/                Vite lib mode
│   └── app/                     Firebase, state, deploy
│       ├── index.html
│       └── src/{main.jsx,App.jsx,firebase-init.js,bookings.js,config.js,hooks/}
└── .github/workflows/deploy.yml
```

**Dependency rule:** `core` depends on nothing; `ui` may depend on `core`;
`app` depends on both. `firebase` appears only in `app`.

**Toolchain:** React 19, Vite (app build + ui lib build), Vitest, Storybook,
React Testing Library.

**Styling:** `packages/ui/src/styles/tokens.css` holds the 13 existing custom
properties; `components.css` takes the remainder of today's stylesheet largely
verbatim. `styles.css` `@import`s both — design-sync only delivers the
transitive `@import` closure of `styles.css` to rendered designs. The app stops
shipping its own stylesheet and imports the library's.

## Component inventory (27)

### `primitives/` (11)

| Component | Key props | Derived from |
|---|---|---|
| `Button` | `variant: primary \| link \| danger \| book \| full`, `disabled`, `onClick` | `.btn-primary`, `.btn-link`, `.btn-danger`, `.btn-book`, `.btn-full` |
| `Card` | `centered`, `children` | `.card`, `.card.centered` |
| `TextField` | `label`, `type`, `placeholder`, `value`, `onChange`, `maxLength` | `input` + `label` |
| `SelectField` | `label`, `options`, `value`, `onChange` | `select` + `label` |
| `Modal` | `title`, `subtitle`, `onClose`, `children` | `.modal-overlay`, `.modal`, `.modal-close` |
| `Toast` | `message`, `tone: default \| error` | `.toast`, `.toast.error` |
| `Chip` | `children` | `.guest-chip` |
| `Tabs` | `tabs[]`, `activeId`, `onChange` | `.tabs`, `.tab-btn.active` |
| `EmptyState` | `children` | `.empty-state` |
| `EmojiHero` | `emoji` | `.emoji-hero` |
| `FormError` | `children` | `.error` |

### `domain/` (10)

| Component | Key props | Derived from |
|---|---|---|
| `AppHeader` | `title`, `emoji`, `profileName`, `onEditProfile` | `.app-header` |
| `StatusDot` | `status: available \| limited \| full` | `.dot` |
| `LegendBar` | — | `.legend` |
| `PagerNav` | `label`, `onPrev`, `onNext` | `.month-nav` + `.day-nav`, unified |
| `WeekdayRow` | — | `.weekday-row` |
| `DayCell` | `day`, `status`, `today`, `past`, `selected`, `empty`, `onClick` | `.day-cell` + modifiers |
| `CalendarGrid` | `cells[]`, `onSelectDay` | `.calendar-grid` |
| `GuestList` | `guests[]` | `.slot-guests`, `.modal-guests` |
| `SlotCard` | `time`, `statusText`, `guests[]`, `state: open \| mine \| full \| past`, `onBook`, `onCancel` | `.slot-card` + modifiers |
| `BookingRow` | `dateLabel`, `timeLabel`, `visitors`, `past`, `onCancel` | `.booking-row` |

### `screens/` (6)

`PinGate`, `ProfileSetup`, `CalendarTab`, `DayTab`, `MyBookingsTab`,
`BookingModal`.

`PagerNav` and `WeekdayRow` are the only components without a one-to-one
predecessor. `.month-nav` and `.day-nav` are currently identical rule sets
serving the same purpose; they collapse into `PagerNav`.

## Data flow

**Organizing rule: the app derives, the screens receive view models.** No
screen computes anything from raw Firestore documents. `CalendarTab` receives
`cells[]` already carrying `{ day, status, today, past, selected }`; `DayTab`
receives `slots[]` already carrying resolved `state` and guest list. This is
what allows the same components to render in Claude Design from fixture data.

`packages/app/src/`:

- `firebase-init.js` — unchanged behavior; CDN URLs replaced by a real
  `firebase` dependency.
- `bookings.js` — `bookSlot` / `cancelSlot` lifted from `js/app.js:551-609`;
  `currentUid` becomes a parameter rather than a module global.
- `hooks/useAuthUid.js` — wraps the existing `authReady` promise → `{ uid, error }`.
- `hooks/useSlots.js` — the `onSnapshot` subscription from `js/app.js:611`,
  unsubscribing on unmount (today it never unsubscribes; under React it must).
- `hooks/useProfile.js`, `hooks/usePinOk.js` — the two `localStorage` keys
  (`gv_profile`, `gv_pin_ok`).
- `hooks/useToast.js` — message, tone, auto-dismiss timer.
- `App.jsx` — owns `activeTab`, `calendarMonth`, `selectedDay`,
  `pendingBooking`, `isEditingProfile`; performs all derivation; selects screen.

Screen selection replaces `showScreen()` with derived state: no pin → `PinGate`;
no profile, or editing → `ProfileSetup`; otherwise the main shell.

## Error handling

`bookSlot` already throws typed codes (`FULL`, `ALREADY_BOOKED`, `RUN_LIMIT`).
These move to `core/errors.js` as exported constants so they cannot drift as
string literals. `App.jsx` maps code → user-facing copy (currently at
`js/app.js:521-531`). Copy stays app-side; a library component does not own
product wording.

Auth failure preserves current behavior: log, show the setup toast, do not
subscribe.

`escapeHtml` (`js/app.js:73`) is deleted. Guest names are currently
interpolated into `innerHTML` and hand-escaped; React escapes by default,
eliminating the category rather than reimplementing the guard.

## Testing

Tests are written before code moves, characterizing existing behavior.

- **`core`** — the primary target. `runLengthAt` / `checkConsecutiveRule`
  (`js/app.js:87-119`) is the app's subtlest logic and currently untested.
  Cases: empty day; single booking; extending a run to exactly the limit;
  extending past the limit; a booking that bridges two runs into an
  over-length one; separate blocks in the same day. Plus slot generation and
  date helpers.
- **`ui`** — React Testing Library on components with behavior: `Tabs`
  switching, `Modal` close-on-overlay-click, `SlotCard` state variants,
  `Button` disabled. Not snapshot-everything.
- **Storybook** — one story per meaningful state; doubles as design-sync's
  verified preview source.
- **`app`** — light. Hooks are thin Firebase wrappers not worth heavy mocking.
  The error-code→copy map is pure and gets a test.

## Deployment

`.github/workflows/deploy.yml` builds `packages/app` and publishes via
`actions/deploy-pages`.

**Manual step required by the repo owner at merge time:** Settings → Pages →
Source, change from "Deploy from a branch" to "GitHub Actions". Performing this
before merge would break the live site. Until merge, `main` serves the current
app unchanged.

## Design sync

`.design-sync/config.json`:

- `shape: "storybook"`
- `storybookConfigDir: "packages/ui/.storybook"`
- `readmeHeader: ".design-sync/conventions.md"`

Target: a new Claude Design project (first-time import → incremental upload
path, so components appear as they are verified).

Conventions header documents the idiom accurately: global CSS classes, no
provider or theme wrapper required — only the stylesheet — plus the token
names, validated against the built artifacts before commit.

**Upload gate (C2):** `grep -r "2707" packages/ui/dist ds-bundle/` must return
no matches before any upload. Publishing leaves the machine and cannot be
fully retracted; this is a mechanical check rather than reliance on care.

## Phases

1. `core` — extract pure logic, tests first.
2. `ui` — components, styles, Storybook. The bulk of the work.
3. `app` — React port, hooks, wiring.
4. Sync + deploy — `/design-sync` run, CI workflow.

Phase 2 is the largest; the design-sync verification loop across 27 components
can itself run for hours.

## Out of scope

- Any visual redesign. Appearance is preserved.
- Changes to Firestore schema or `firestore.rules`.
- Replacing the shared-passcode access model.
- Dark mode (no dark palette exists today).
