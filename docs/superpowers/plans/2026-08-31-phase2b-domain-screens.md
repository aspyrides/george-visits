# Phase 2B: Domain Components + Screens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete `@gv/ui` with the 10 domain components and 6 screens that give the library this app's actual visual language.

**Architecture:** Every component remains a pure function of props, composed from the 11 primitives Phase 2A delivered. Domain components own the app-specific markup (slot cards, calendar cells, booking rows); screens compose domain components into whole views. No screen computes anything from raw data — the app derives view models and passes them down, which is what lets these same components render in Claude Design from fixture data.

**Tech Stack:** React 19, Vite 6 (lib mode), Storybook 8, Vitest + `@testing-library/react` + jsdom. All already configured.

**Spec:** `docs/superpowers/specs/2026-08-29-design-system-extraction-design.md`

## Global Constraints

- Branch is `design-system`. Never commit to `main`.
- **`packages/ui` must NOT depend on `firebase`.** Runtime `dependencies` stays exactly `{"@gv/core": "*"}`.
- **No component may read `localStorage`, `window.location`, or `document` directly, or perform any I/O.** Every component is a pure function of its props.
- **No product copy or configuration inside `packages/ui`.** Every user-facing string arrives as a prop. The passcode string `2707` must never appear there. This is why components like `SlotCard` take `bookLabel`/`cancelLabel` rather than hardcoding "Book" and "Cancel your visit" — the library owns structure and styling, the app owns wording.
- CSS class names are the library's public styling vocabulary. Use exactly the class names specified — each must match a rule that already exists in `packages/ui/src/styles/components.css`. Do not invent class names.
- Because `vitest.config.js` sets `globals: false`, every test file must import `describe`/`it`/`expect`/`vi` explicitly from `"vitest"`. `src/test-setup.js` already registers `afterEach(cleanup)`; do not add cleanup calls to individual test files.
- The repo-root `js/`, `css/`, and `index.html` must NOT be modified or deleted. The live app runs on them until Phase 3.
- `packages/core`'s 62 tests and `packages/ui`'s 43 existing tests must keep passing.

## Three corrections to the spec's inventory

The spec was written before the source was read closely. These three points supersede it:

1. **`SlotCard` has FIVE states, not four.** `js/app.js:398-414` renders: `past` (no action), `mine` (danger "Cancel your visit"), `full` (disabled "Full"), **`blocked`** (disabled "Too long a visit" with an explanatory `title` attribute, when the consecutive-slot rule would reject the booking), and `open` (book button). The `blocked` state is easy to miss and is a real product behavior.
2. **`GuestList` has two presentations, not one.** `js/app.js:379-388` renders slot-card guests as chips (`name · relationship (+N)`); `js/app.js:488-494` renders modal guests as plain comma-joined text (`name (relationship)`) behind a prefix. A `variant` prop covers both.
3. **`AppHeader`'s badge** renders `name · relationship`, falling back to bare `name` when there is no relationship (`js/app.js:253`).

---

### Task 1: Five simple domain components

`StatusDot`, `LegendBar`, `WeekdayRow`, `PagerNav`, `AppHeader`.

**Files:**
- Create: `packages/ui/src/domain/StatusDot.jsx`, `LegendBar.jsx`, `WeekdayRow.jsx`, `PagerNav.jsx`, `AppHeader.jsx`
- Create: a `.test.jsx` and a `.stories.jsx` beside each
- Modify: `packages/ui/src/index.js`

**Interfaces:**
- Consumes: `Button` from `../primitives/Button.jsx` (used by `AppHeader`).
- Produces, all exported from the `@gv/ui` barrel:
  - `StatusDot({ status })` — `status` is `"available" | "limited" | "full"`, default `"available"`
  - `LegendBar({ items })` — `items` is `Array<{ status: string, label: string }>`
  - `WeekdayRow({ days })` — `days` is `string[]` (7 entries)
  - `PagerNav({ label, onPrev, onNext, prevAriaLabel, nextAriaLabel })`
  - `AppHeader({ title, emoji, profileName, editLabel, onEditProfile })`

- [ ] **Step 1: Write the failing tests**

Create `packages/ui/src/domain/StatusDot.test.jsx`:

```jsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { StatusDot } from "./StatusDot.jsx";

describe("StatusDot", () => {
  it.each(["available", "limited", "full"])("renders the %s status class", (status) => {
    const { container } = render(<StatusDot status={status} />);
    expect(container.firstChild).toHaveClass("dot", status);
  });

  it("defaults to available", () => {
    const { container } = render(<StatusDot />);
    expect(container.firstChild).toHaveClass("dot", "available");
  });
});
```

Create `packages/ui/src/domain/LegendBar.test.jsx`:

```jsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LegendBar } from "./LegendBar.jsx";

const ITEMS = [
  { status: "available", label: "Open" },
  { status: "limited", label: "Filling up" },
  { status: "full", label: "Fully booked" },
];

describe("LegendBar", () => {
  it("renders one entry per item", () => {
    const { container } = render(<LegendBar items={ITEMS} />);
    expect(container.querySelectorAll(".legend > span")).toHaveLength(3);
  });

  it("renders each label", () => {
    render(<LegendBar items={ITEMS} />);
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("Filling up")).toBeInTheDocument();
    expect(screen.getByText("Fully booked")).toBeInTheDocument();
  });

  it("renders a dot with the matching status for each item", () => {
    const { container } = render(<LegendBar items={ITEMS} />);
    expect(container.querySelector(".dot.available")).toBeInTheDocument();
    expect(container.querySelector(".dot.limited")).toBeInTheDocument();
    expect(container.querySelector(".dot.full")).toBeInTheDocument();
  });

  it("renders an empty legend when given no items", () => {
    const { container } = render(<LegendBar items={[]} />);
    expect(container.querySelectorAll(".legend > span")).toHaveLength(0);
  });
});
```

Create `packages/ui/src/domain/WeekdayRow.test.jsx`:

```jsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { WeekdayRow } from "./WeekdayRow.jsx";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

describe("WeekdayRow", () => {
  it("renders one cell per day", () => {
    const { container } = render(<WeekdayRow days={DAYS} />);
    expect(container.querySelectorAll(".weekday-row > span")).toHaveLength(7);
  });

  it("renders the days in the order given", () => {
    const { container } = render(<WeekdayRow days={DAYS} />);
    const text = [...container.querySelectorAll(".weekday-row > span")].map((s) => s.textContent);
    expect(text).toEqual(DAYS);
  });
});
```

Create `packages/ui/src/domain/PagerNav.test.jsx`:

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PagerNav } from "./PagerNav.jsx";

describe("PagerNav", () => {
  it("renders its label as a heading", () => {
    render(<PagerNav label="August 2026" />);
    expect(screen.getByRole("heading", { name: "August 2026" })).toBeInTheDocument();
  });

  it("calls onPrev when the previous button is clicked", async () => {
    const onPrev = vi.fn();
    render(<PagerNav label="August 2026" onPrev={onPrev} />);
    await userEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(onPrev).toHaveBeenCalledOnce();
  });

  it("calls onNext when the next button is clicked", async () => {
    const onNext = vi.fn();
    render(<PagerNav label="August 2026" onNext={onNext} />);
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it("accepts custom aria labels", () => {
    render(<PagerNav label="Saturday" prevAriaLabel="Previous day" nextAriaLabel="Next day" />);
    expect(screen.getByRole("button", { name: "Previous day" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next day" })).toBeInTheDocument();
  });

  it("uses the pager-nav class so month and day navigation share one rule", () => {
    const { container } = render(<PagerNav label="August 2026" />);
    expect(container.firstChild).toHaveClass("pager-nav");
  });
});
```

Create `packages/ui/src/domain/AppHeader.test.jsx`:

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppHeader } from "./AppHeader.jsx";

describe("AppHeader", () => {
  it("renders the title and emoji", () => {
    render(<AppHeader title="Visit George" emoji="👶" />);
    expect(screen.getByRole("heading", { name: "Visit George" })).toBeInTheDocument();
    expect(screen.getByText("👶")).toHaveClass("emoji");
  });

  it("renders the profile badge when a profile name is given", () => {
    render(<AppHeader title="Visit George" profileName="Aunt Maria · Auntie" />);
    expect(screen.getByText("Aunt Maria · Auntie")).toHaveClass("profile-badge");
  });

  it("omits the badge entirely when there is no profile name", () => {
    const { container } = render(<AppHeader title="Visit George" />);
    expect(container.querySelector(".profile-badge")).toBeNull();
  });

  it("calls onEditProfile when the edit button is clicked", async () => {
    const onEditProfile = vi.fn();
    render(<AppHeader title="Visit George" profileName="Aunt Maria" editLabel="Edit" onEditProfile={onEditProfile} />);
    await userEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(onEditProfile).toHaveBeenCalledOnce();
  });

  it("omits the edit button when no handler is given", () => {
    render(<AppHeader title="Visit George" profileName="Aunt Maria" />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("omits the emoji element when no emoji is given", () => {
    const { container } = render(<AppHeader title="Visit George" />);
    expect(container.querySelector(".emoji")).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- packages/ui/src/domain`
Expected: FAIL — the five modules cannot be resolved.

- [ ] **Step 3: Write the implementations**

Create `packages/ui/src/domain/StatusDot.jsx`:

```jsx
export function StatusDot({ status = "available" }) {
  return <i className={`dot ${status}`} />;
}
```

Create `packages/ui/src/domain/LegendBar.jsx`:

```jsx
import { StatusDot } from "./StatusDot.jsx";

export function LegendBar({ items = [] }) {
  return (
    <div className="legend">
      {items.map((item) => (
        <span key={item.status}>
          <StatusDot status={item.status} /> {item.label}
        </span>
      ))}
    </div>
  );
}
```

Create `packages/ui/src/domain/WeekdayRow.jsx`:

```jsx
export function WeekdayRow({ days = [] }) {
  return (
    <div className="weekday-row">
      {days.map((day, i) => (
        <span key={i}>{day}</span>
      ))}
    </div>
  );
}
```

The index key is deliberate here: weekday initials repeat (`S`…`S`, `T`…`T`), so the value cannot be a stable key.

Create `packages/ui/src/domain/PagerNav.jsx`:

```jsx
export function PagerNav({
  label,
  onPrev,
  onNext,
  prevAriaLabel = "Previous",
  nextAriaLabel = "Next",
}) {
  return (
    <div className="pager-nav">
      <button type="button" onClick={onPrev} aria-label={prevAriaLabel}>
        ‹
      </button>
      <h2>{label}</h2>
      <button type="button" onClick={onNext} aria-label={nextAriaLabel}>
        ›
      </button>
    </div>
  );
}
```

This is the unification of the original `.month-nav` and `.day-nav`, whose rule sets were identical. Task 1 of Phase 2A already renamed the stylesheet rule to `.pager-nav`.

Create `packages/ui/src/domain/AppHeader.jsx`:

```jsx
import { Button } from "../primitives/Button.jsx";

export function AppHeader({ title, emoji, profileName, editLabel, onEditProfile }) {
  return (
    <header className="app-header">
      <div className="header-title">
        {emoji && <span className="emoji">{emoji}</span>}
        <h1>{title}</h1>
      </div>
      <div className="header-profile">
        {profileName && <span className="profile-badge">{profileName}</span>}
        {onEditProfile && (
          <Button variant="link" onClick={onEditProfile}>
            {editLabel}
          </Button>
        )}
      </div>
    </header>
  );
}
```

`profileName` is the already-composed string (`"Aunt Maria · Auntie"` or just `"Aunt Maria"`). The library does not join name and relationship — that is the app's derivation, per the "app derives, screens receive view models" rule.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- packages/ui/src/domain`
Expected: PASS, 20 tests.

- [ ] **Step 5: Write the stories**

Create `packages/ui/src/domain/StatusDot.stories.jsx`:

```jsx
import { StatusDot } from "./StatusDot.jsx";

export default { title: "Domain/StatusDot", component: StatusDot };

export const Available = { args: { status: "available" } };
export const Limited = { args: { status: "limited" } };
export const Full = { args: { status: "full" } };
```

Create `packages/ui/src/domain/LegendBar.stories.jsx`:

```jsx
import { LegendBar } from "./LegendBar.jsx";

export default { title: "Domain/LegendBar", component: LegendBar };

export const Default = {
  args: {
    items: [
      { status: "available", label: "Open" },
      { status: "limited", label: "Filling up" },
      { status: "full", label: "Fully booked" },
    ],
  },
};
```

Create `packages/ui/src/domain/WeekdayRow.stories.jsx`:

```jsx
import { WeekdayRow } from "./WeekdayRow.jsx";

export default { title: "Domain/WeekdayRow", component: WeekdayRow };

export const Default = { args: { days: ["S", "M", "T", "W", "T", "F", "S"] } };
```

Create `packages/ui/src/domain/PagerNav.stories.jsx`:

```jsx
import { PagerNav } from "./PagerNav.jsx";

export default { title: "Domain/PagerNav", component: PagerNav };

export const Month = {
  args: { label: "August 2026", prevAriaLabel: "Previous month", nextAriaLabel: "Next month" },
};
export const Day = {
  args: { label: "Saturday, August 29", prevAriaLabel: "Previous day", nextAriaLabel: "Next day" },
};
```

Create `packages/ui/src/domain/AppHeader.stories.jsx`:

```jsx
import { AppHeader } from "./AppHeader.jsx";

export default {
  title: "Domain/AppHeader",
  component: AppHeader,
  parameters: { layout: "fullscreen" },
};

export const WithProfile = {
  args: {
    title: "Visit George",
    emoji: "👶",
    profileName: "Aunt Maria · Auntie",
    editLabel: "Edit",
    onEditProfile: () => {},
  },
};
export const NameOnly = {
  args: { title: "Visit George", emoji: "👶", profileName: "Aunt Maria", editLabel: "Edit", onEditProfile: () => {} },
};
export const NoProfile = { args: { title: "Visit George", emoji: "👶" } };
```

- [ ] **Step 6: Update the barrel**

Append these five lines to `packages/ui/src/index.js`, keeping the existing 11 primitive exports:

```js
export { AppHeader } from "./domain/AppHeader.jsx";
export { LegendBar } from "./domain/LegendBar.jsx";
export { PagerNav } from "./domain/PagerNav.jsx";
export { StatusDot } from "./domain/StatusDot.jsx";
export { WeekdayRow } from "./domain/WeekdayRow.jsx";
```

Add the same five names to the array in `packages/ui/src/index.test.js`, and update its test name from `"exports all 11 primitives"` to `"exports all 16 components"`.

- [ ] **Step 7: Run the whole suite**

Run: `npm test`
Expected: PASS, 125 tests (62 core + 63 ui).

- [ ] **Step 8: Verify the constraints**

Run: `grep -rn "firebase\|localStorage\|window\.location\|document\.\|2707" packages/ui/src/ || echo "OK: ui is clean"`
Expected: `OK: ui is clean`

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/domain packages/ui/src/index.js packages/ui/src/index.test.js
git commit -m "Add five simple domain components to @gv/ui"
```

---

### Task 2: Five complex domain components

`DayCell`, `CalendarGrid`, `GuestList`, `SlotCard`, `BookingRow`. These carry the app's real visual language and have the most states.

**Files:**
- Create: `packages/ui/src/domain/DayCell.jsx`, `CalendarGrid.jsx`, `GuestList.jsx`, `SlotCard.jsx`, `BookingRow.jsx`
- Create: a `.test.jsx` and a `.stories.jsx` beside each
- Modify: `packages/ui/src/index.js`, `packages/ui/src/index.test.js`

**Interfaces:**
- Consumes: `StatusDot` (Task 1), `Chip` and `Button` (primitives).
- Produces, all exported from the barrel:
  - `DayCell({ day, status, today, past, selected, empty, onClick })`
  - `CalendarGrid({ cells, onSelectDay })` — `cells` is `Array<{ day, status, today, past, selected } | { empty: true }>`; `onSelectDay` receives the `day` number
  - `GuestList({ guests, variant, inlinePrefix })` — `guests` is `Array<{ name, relationship?, visitorCount? }>`; `variant` is `"chips" | "inline"`, default `"chips"`
  - `SlotCard({ time, statusText, guests, state, actionLabel, actionTitle, onBook, onCancel })` — `state` is `"open" | "mine" | "full" | "blocked" | "past"`
  - `BookingRow({ dateLabel, atLabel, timeLabel, visitorsLabel, past, cancelLabel, onCancel })`

- [ ] **Step 1: Write the failing tests**

Create `packages/ui/src/domain/DayCell.test.jsx`:

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DayCell } from "./DayCell.jsx";

describe("DayCell", () => {
  it("renders the day number", () => {
    render(<DayCell day={29} status="available" />);
    expect(screen.getByText("29")).toBeInTheDocument();
  });

  it("renders a status dot", () => {
    const { container } = render(<DayCell day={29} status="limited" />);
    expect(container.querySelector(".dot.limited")).toBeInTheDocument();
  });

  it("renders an empty placeholder with no content", () => {
    const { container } = render(<DayCell empty />);
    expect(container.firstChild).toHaveClass("day-cell", "empty");
    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it("marks today", () => {
    const { container } = render(<DayCell day={29} status="available" today />);
    expect(container.firstChild).toHaveClass("day-cell", "today");
  });

  it("marks the selected day", () => {
    const { container } = render(<DayCell day={29} status="available" selected />);
    expect(container.firstChild).toHaveClass("day-cell", "selected");
  });

  it("marks past days and hides their dot", () => {
    const { container } = render(<DayCell day={1} status="available" past />);
    expect(container.firstChild).toHaveClass("day-cell", "past");
    expect(container.querySelector(".dot")).toBeNull();
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<DayCell day={29} status="available" onClick={onClick} />);
    await userEvent.click(screen.getByText("29"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not call onClick for a past day", async () => {
    const onClick = vi.fn();
    render(<DayCell day={1} status="available" past onClick={onClick} />);
    await userEvent.click(screen.getByText("1"));
    expect(onClick).not.toHaveBeenCalled();
  });
});
```

Create `packages/ui/src/domain/CalendarGrid.test.jsx`:

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CalendarGrid } from "./CalendarGrid.jsx";

const CELLS = [
  { empty: true },
  { empty: true },
  { day: 1, status: "available" },
  { day: 2, status: "limited", today: true },
  { day: 3, status: "full", selected: true },
];

describe("CalendarGrid", () => {
  it("renders one cell per entry, leading blanks included", () => {
    const { container } = render(<CalendarGrid cells={CELLS} />);
    expect(container.querySelectorAll(".day-cell")).toHaveLength(5);
  });

  it("renders the leading blanks as empty cells", () => {
    const { container } = render(<CalendarGrid cells={CELLS} />);
    expect(container.querySelectorAll(".day-cell.empty")).toHaveLength(2);
  });

  it("calls onSelectDay with the day number", async () => {
    const onSelectDay = vi.fn();
    render(<CalendarGrid cells={CELLS} onSelectDay={onSelectDay} />);
    await userEvent.click(screen.getByText("1"));
    expect(onSelectDay).toHaveBeenCalledWith(1);
  });

  it("renders nothing but the grid when given no cells", () => {
    const { container } = render(<CalendarGrid cells={[]} />);
    expect(container.firstChild).toHaveClass("calendar-grid");
    expect(container.querySelectorAll(".day-cell")).toHaveLength(0);
  });
});
```

Create `packages/ui/src/domain/GuestList.test.jsx`:

```jsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GuestList } from "./GuestList.jsx";

const GUESTS = [
  { name: "Aunt Maria", relationship: "Auntie", visitorCount: 1 },
  { name: "Tom", relationship: "", visitorCount: 3 },
];

describe("GuestList (chips variant)", () => {
  it("renders one chip per guest", () => {
    const { container } = render(<GuestList guests={GUESTS} />);
    expect(container.querySelectorAll(".guest-chip")).toHaveLength(2);
  });

  it("joins name and relationship with a middot", () => {
    render(<GuestList guests={GUESTS} />);
    expect(screen.getByText("Aunt Maria · Auntie")).toBeInTheDocument();
  });

  it("omits the relationship when there is none", () => {
    render(<GuestList guests={[{ name: "Tom", visitorCount: 1 }]} />);
    expect(screen.getByText("Tom")).toBeInTheDocument();
  });

  it("shows the extra visitor count when a guest brings others", () => {
    render(<GuestList guests={GUESTS} />);
    expect(screen.getByText("Tom (+2)")).toBeInTheDocument();
  });

  it("uses the slot-guests container", () => {
    const { container } = render(<GuestList guests={GUESTS} />);
    expect(container.firstChild).toHaveClass("slot-guests");
  });
});

describe("GuestList (inline variant)", () => {
  it("renders guests as comma-joined text", () => {
    render(<GuestList guests={GUESTS} variant="inline" />);
    expect(screen.getByText("Aunt Maria (Auntie), Tom")).toBeInTheDocument();
  });

  it("renders the prefix before the names", () => {
    render(<GuestList guests={GUESTS} variant="inline" inlinePrefix="Already booked: " />);
    expect(screen.getByText("Already booked: Aunt Maria (Auntie), Tom")).toBeInTheDocument();
  });

  it("uses the modal-guests container", () => {
    const { container } = render(<GuestList guests={GUESTS} variant="inline" />);
    expect(container.firstChild).toHaveClass("modal-guests");
  });
});

describe("GuestList (empty)", () => {
  it("renders nothing when there are no guests", () => {
    const { container } = render(<GuestList guests={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
```

Create `packages/ui/src/domain/SlotCard.test.jsx`:

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SlotCard } from "./SlotCard.jsx";

const BASE = { time: "9:00 AM", statusText: "3 of 3 spots open" };

describe("SlotCard", () => {
  it("renders the time and status", () => {
    render(<SlotCard {...BASE} state="open" actionLabel="Book" />);
    expect(screen.getByText("9:00 AM")).toHaveClass("slot-time");
    expect(screen.getByText("3 of 3 spots open")).toHaveClass("slot-status");
  });

  it("open: renders a book button that calls onBook", async () => {
    const onBook = vi.fn();
    render(<SlotCard {...BASE} state="open" actionLabel="Book" onBook={onBook} />);
    const btn = screen.getByRole("button", { name: "Book" });
    expect(btn).toHaveClass("btn-book");
    await userEvent.click(btn);
    expect(onBook).toHaveBeenCalledOnce();
  });

  it("mine: adds the mine class and a cancel button that calls onCancel", async () => {
    const onCancel = vi.fn();
    const { container } = render(
      <SlotCard {...BASE} state="mine" actionLabel="Cancel your visit" onCancel={onCancel} />
    );
    expect(container.firstChild).toHaveClass("slot-card", "mine");
    const btn = screen.getByRole("button", { name: "Cancel your visit" });
    expect(btn).toHaveClass("btn-danger");
    await userEvent.click(btn);
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("full: renders a disabled button", () => {
    render(<SlotCard {...BASE} state="full" statusText="Fully booked" actionLabel="Full" />);
    const btn = screen.getByRole("button", { name: "Full" });
    expect(btn).toBeDisabled();
    expect(btn).toHaveClass("btn-full");
  });

  it("blocked: renders a disabled button carrying the explanatory title", () => {
    render(
      <SlotCard
        {...BASE}
        state="blocked"
        actionLabel="Too long a visit"
        actionTitle="Booking this would make a run of more than 3 consecutive slots for you"
      />
    );
    const btn = screen.getByRole("button", { name: "Too long a visit" });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute(
      "title",
      "Booking this would make a run of more than 3 consecutive slots for you"
    );
  });

  it("past: adds the past class and renders no action button", () => {
    const { container } = render(<SlotCard {...BASE} state="past" statusText="Past" />);
    expect(container.firstChild).toHaveClass("slot-card", "past");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders guests as chips when given", () => {
    const { container } = render(
      <SlotCard {...BASE} state="open" actionLabel="Book" guests={[{ name: "Tom", visitorCount: 1 }]} />
    );
    expect(container.querySelector(".guest-chip")).toBeInTheDocument();
  });

  it("renders no guest container when there are no guests", () => {
    const { container } = render(<SlotCard {...BASE} state="open" actionLabel="Book" />);
    expect(container.querySelector(".slot-guests")).toBeNull();
  });
});
```

Create `packages/ui/src/domain/BookingRow.test.jsx`:

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BookingRow } from "./BookingRow.jsx";

const BASE = { dateLabel: "Aug 29", atLabel: "at", timeLabel: "9:00 AM" };

describe("BookingRow", () => {
  it("renders the date in bold and the time", () => {
    render(<BookingRow {...BASE} cancelLabel="Cancel" onCancel={() => {}} />);
    expect(screen.getByText("Aug 29").tagName).toBe("STRONG");
    expect(screen.getByText(/9:00 AM/)).toBeInTheDocument();
  });

  it("shows the visitor count line when given", () => {
    render(<BookingRow {...BASE} visitorsLabel="3 visitors" cancelLabel="Cancel" onCancel={() => {}} />);
    expect(screen.getByText("3 visitors")).toHaveClass("muted");
  });

  it("omits the visitor count line when not given", () => {
    const { container } = render(<BookingRow {...BASE} cancelLabel="Cancel" onCancel={() => {}} />);
    expect(container.querySelector(".muted")).toBeNull();
  });

  it("calls onCancel when the cancel button is clicked", async () => {
    const onCancel = vi.fn();
    render(<BookingRow {...BASE} cancelLabel="Cancel" onCancel={onCancel} />);
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("past: adds the past class and renders no cancel button", () => {
    const { container } = render(<BookingRow {...BASE} past cancelLabel="Cancel" onCancel={() => {}} />);
    expect(container.firstChild).toHaveClass("booking-row", "past");
    expect(screen.queryByRole("button")).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- packages/ui/src/domain`
Expected: FAIL — the five new modules cannot be resolved. Task 1's 20 tests still pass.

- [ ] **Step 3: Write the implementations**

Create `packages/ui/src/domain/DayCell.jsx`:

```jsx
import { StatusDot } from "./StatusDot.jsx";

export function DayCell({
  day,
  status,
  today = false,
  past = false,
  selected = false,
  empty = false,
  onClick,
}) {
  if (empty) return <div className="day-cell empty" />;

  const classes = ["day-cell", today && "today", selected && "selected", past && "past"]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} onClick={past ? undefined : onClick}>
      <span>{day}</span>
      {!past && status && <StatusDot status={status} />}
    </div>
  );
}
```

The class order and the "past days show no dot, and are not clickable" behavior both mirror `js/app.js:325-345`.

Create `packages/ui/src/domain/CalendarGrid.jsx`:

```jsx
import { DayCell } from "./DayCell.jsx";

export function CalendarGrid({ cells = [], onSelectDay }) {
  return (
    <div className="calendar-grid">
      {cells.map((cell, i) =>
        cell.empty ? (
          <DayCell key={`empty-${i}`} empty />
        ) : (
          <DayCell key={`day-${cell.day}`} {...cell} onClick={() => onSelectDay?.(cell.day)} />
        )
      )}
    </div>
  );
}
```

Create `packages/ui/src/domain/GuestList.jsx`:

```jsx
import { Chip } from "../primitives/Chip.jsx";

function chipLabel({ name, relationship, visitorCount = 1 }) {
  const rel = relationship ? ` · ${relationship}` : "";
  const extra = visitorCount > 1 ? ` (+${visitorCount - 1})` : "";
  return `${name}${rel}${extra}`;
}

function inlineLabel({ name, relationship }) {
  return relationship ? `${name} (${relationship})` : name;
}

export function GuestList({ guests = [], variant = "chips", inlinePrefix = "" }) {
  if (!guests.length) return null;

  if (variant === "inline") {
    return (
      <div className="modal-guests">
        {inlinePrefix}
        {guests.map(inlineLabel).join(", ")}
      </div>
    );
  }

  return (
    <div className="slot-guests">
      {guests.map((guest, i) => (
        <Chip key={i}>{chipLabel(guest)}</Chip>
      ))}
    </div>
  );
}
```

The two label formats are not interchangeable — they are transcribed from `js/app.js:382-386` (chips) and `js/app.js:490-493` (inline) respectively. The index key is deliberate: two guests can share a name.

Create `packages/ui/src/domain/SlotCard.jsx`:

```jsx
import { Button } from "../primitives/Button.jsx";
import { GuestList } from "./GuestList.jsx";

export function SlotCard({
  time,
  statusText,
  guests = [],
  state = "open",
  actionLabel,
  actionTitle,
  onBook,
  onCancel,
}) {
  const classes = ["slot-card", state === "past" && "past", state === "mine" && "mine"]
    .filter(Boolean)
    .join(" ");

  let action = null;
  if (state === "mine") {
    action = (
      <Button variant="danger" onClick={onCancel}>
        {actionLabel}
      </Button>
    );
  } else if (state === "full" || state === "blocked") {
    action = (
      <Button variant="full" disabled title={actionTitle}>
        {actionLabel}
      </Button>
    );
  } else if (state === "open") {
    action = (
      <Button variant="book" onClick={onBook}>
        {actionLabel}
      </Button>
    );
  }

  return (
    <div className={classes}>
      <div className="slot-time">{time}</div>
      <div className="slot-info">
        <div className="slot-status">{statusText}</div>
        <GuestList guests={guests} />
      </div>
      <div className="slot-action">{action}</div>
    </div>
  );
}
```

`past` renders no action at all, matching `js/app.js:399`. `full` and `blocked` share a disabled `btn-full` button and differ only in label and `title` — `blocked` is the consecutive-slot-rule rejection at `js/app.js:409-412`.

Create `packages/ui/src/domain/BookingRow.jsx`:

```jsx
import { Button } from "../primitives/Button.jsx";

export function BookingRow({
  dateLabel,
  atLabel,
  timeLabel,
  visitorsLabel,
  past = false,
  cancelLabel,
  onCancel,
}) {
  return (
    <div className={past ? "booking-row past" : "booking-row"}>
      <div>
        <strong>{dateLabel}</strong> {atLabel} {timeLabel}
        {visitorsLabel && <div className="muted">{visitorsLabel}</div>}
      </div>
      {!past && onCancel && (
        <Button variant="danger" onClick={onCancel}>
          {cancelLabel}
        </Button>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- packages/ui/src/domain`
Expected: PASS, 51 tests (20 from Task 1 + 31 new).

- [ ] **Step 5: Write the stories**

Create `packages/ui/src/domain/DayCell.stories.jsx`:

```jsx
import { DayCell } from "./DayCell.jsx";

export default { title: "Domain/DayCell", component: DayCell };

export const Available = { args: { day: 12, status: "available" } };
export const FillingUp = { args: { day: 13, status: "limited" } };
export const FullyBooked = { args: { day: 14, status: "full" } };
export const Today = { args: { day: 29, status: "available", today: true } };
export const Selected = { args: { day: 29, status: "available", selected: true } };
export const Past = { args: { day: 3, status: "available", past: true } };
```

Create `packages/ui/src/domain/CalendarGrid.stories.jsx`:

```jsx
import { CalendarGrid } from "./CalendarGrid.jsx";

const AUGUST = [
  ...Array.from({ length: 6 }, () => ({ empty: true })),
  ...Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    const status = day % 7 === 0 ? "full" : day % 3 === 0 ? "limited" : "available";
    return { day, status, past: day < 29, today: day === 29, selected: day === 29 };
  }),
];

export default {
  title: "Domain/CalendarGrid",
  component: CalendarGrid,
  parameters: { layout: "padded" },
};

export const AugustMonth = { args: { cells: AUGUST, onSelectDay: () => {} } };
```

Create `packages/ui/src/domain/GuestList.stories.jsx`:

```jsx
import { GuestList } from "./GuestList.jsx";

const GUESTS = [
  { name: "Aunt Maria", relationship: "Auntie", visitorCount: 1 },
  { name: "Tom", relationship: "Friend of the family", visitorCount: 3 },
];

export default { title: "Domain/GuestList", component: GuestList };

export const Chips = { args: { guests: GUESTS } };
export const Inline = { args: { guests: GUESTS, variant: "inline", inlinePrefix: "Already booked: " } };
```

Create `packages/ui/src/domain/SlotCard.stories.jsx`:

```jsx
import { SlotCard } from "./SlotCard.jsx";

export default {
  title: "Domain/SlotCard",
  component: SlotCard,
  parameters: { layout: "padded" },
};

export const Open = {
  args: { time: "9:00 AM", statusText: "3 of 3 spots open", state: "open", actionLabel: "Book" },
};
export const PartiallyBooked = {
  args: {
    time: "9:30 AM",
    statusText: "1 of 3 spots open",
    state: "open",
    actionLabel: "Book",
    guests: [{ name: "Aunt Maria", relationship: "Auntie", visitorCount: 2 }],
  },
};
export const Mine = {
  args: {
    time: "10:00 AM",
    statusText: "1 of 3 spots open",
    state: "mine",
    actionLabel: "Cancel your visit",
    guests: [{ name: "You", visitorCount: 2 }],
  },
};
export const FullyBooked = {
  args: {
    time: "10:30 AM",
    statusText: "Fully booked",
    state: "full",
    actionLabel: "Full",
    guests: [{ name: "Grandma", relationship: "Grandmother", visitorCount: 3 }],
  },
};
export const Blocked = {
  args: {
    time: "11:00 AM",
    statusText: "3 of 3 spots open",
    state: "blocked",
    actionLabel: "Too long a visit",
    actionTitle: "Booking this would make a run of more than 3 consecutive slots for you",
  },
};
export const Past = { args: { time: "8:30 AM", statusText: "Past", state: "past" } };
```

Create `packages/ui/src/domain/BookingRow.stories.jsx`:

```jsx
import { BookingRow } from "./BookingRow.jsx";

export default {
  title: "Domain/BookingRow",
  component: BookingRow,
  parameters: { layout: "padded" },
};

export const Upcoming = {
  args: { dateLabel: "Aug 30", atLabel: "at", timeLabel: "9:00 AM", cancelLabel: "Cancel", onCancel: () => {} },
};
export const WithExtraVisitors = {
  args: {
    dateLabel: "Aug 30",
    atLabel: "at",
    timeLabel: "9:00 AM",
    visitorsLabel: "3 visitors",
    cancelLabel: "Cancel",
    onCancel: () => {},
  },
};
export const Past = {
  args: { dateLabel: "Aug 24", atLabel: "at", timeLabel: "2:00 PM", past: true, cancelLabel: "Cancel", onCancel: () => {} },
};
```

- [ ] **Step 6: Update the barrel**

Append these five lines to `packages/ui/src/index.js`:

```js
export { BookingRow } from "./domain/BookingRow.jsx";
export { CalendarGrid } from "./domain/CalendarGrid.jsx";
export { DayCell } from "./domain/DayCell.jsx";
export { GuestList } from "./domain/GuestList.jsx";
export { SlotCard } from "./domain/SlotCard.jsx";
```

Add the same five names to the array in `packages/ui/src/index.test.js` and update its test name to `"exports all 21 components"`.

- [ ] **Step 7: Run the whole suite**

Run: `npm test`
Expected: PASS, 156 tests (62 core + 94 ui).

- [ ] **Step 8: Verify the constraints and build**

Run: `grep -rn "firebase\|localStorage\|window\.location\|document\.\|2707" packages/ui/src/ || echo "OK: ui is clean"`
Expected: `OK: ui is clean`

Run: `npm run build`
Expected: succeeds.

Run: `npm run build-storybook --workspace @gv/ui`
Expected: succeeds. Report the story count.

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/domain packages/ui/src/index.js packages/ui/src/index.test.js
git commit -m "Add five complex domain components to @gv/ui"
```

---

### Task 3: Three screens — `PinGate`, `ProfileSetup`, `MyBookingsTab`

**Files:**
- Create: `packages/ui/src/screens/PinGate.jsx`, `ProfileSetup.jsx`, `MyBookingsTab.jsx`
- Create: a `.test.jsx` and a `.stories.jsx` beside each
- Modify: `packages/ui/src/index.js`, `packages/ui/src/index.test.js`

**Interfaces:**
- Consumes: `Card`, `EmojiHero`, `TextField`, `SelectField`, `Button`, `FormError`, `EmptyState` (primitives); `BookingRow` (Task 2).
- Produces:
  - `PinGate({ emoji, title, prompt, placeholder, value, onChange, onSubmit, submitLabel, error })`
  - `ProfileSetup({ emoji, heading, subtitle, nameLabel, namePlaceholder, name, onNameChange, relationshipLabel, relationshipOptions, relationship, onRelationshipChange, onSubmit, submitLabel, cancelLabel, onCancel })`
  - `MyBookingsTab({ heading, bookings, emptyMessage })` — `bookings` is `Array<{ id: string } & BookingRowProps>`

Every user-facing string is a prop. `PinGate` in particular **validates nothing** — it does not know the passcode, it only reports submissions and displays whatever error the app hands it. That is what keeps the family passcode out of the library and out of anything uploaded to the design tool.

- [ ] **Step 1: Write the failing tests**

Create `packages/ui/src/screens/PinGate.test.jsx`:

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PinGate } from "./PinGate.jsx";

const BASE = {
  emoji: "👶",
  title: "Visit Schedule",
  prompt: "Enter the family passcode to continue.",
  placeholder: "Passcode",
  submitLabel: "Continue",
  value: "",
  onChange: () => {},
};

describe("PinGate", () => {
  it("renders the emoji, title and prompt", () => {
    render(<PinGate {...BASE} />);
    expect(screen.getByText("👶")).toHaveClass("emoji-hero");
    expect(screen.getByRole("heading", { name: "Visit Schedule" })).toBeInTheDocument();
    expect(screen.getByText("Enter the family passcode to continue.")).toBeInTheDocument();
  });

  it("masks the passcode input", () => {
    render(<PinGate {...BASE} />);
    expect(screen.getByPlaceholderText("Passcode")).toHaveAttribute("type", "password");
  });

  it("calls onSubmit when the form is submitted", async () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(<PinGate {...BASE} value="1234" onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("shows the error it is given", () => {
    render(<PinGate {...BASE} error="That's not quite right — try again." />);
    expect(screen.getByText("That's not quite right — try again.")).toHaveClass("error");
  });

  it("renders no error element when there is no error", () => {
    const { container } = render(<PinGate {...BASE} />);
    expect(container.querySelector(".error")).toBeNull();
  });
});
```

Create `packages/ui/src/screens/ProfileSetup.test.jsx`:

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileSetup } from "./ProfileSetup.jsx";

const OPTIONS = [
  { value: "", label: "Prefer not to say" },
  { value: "Auntie", label: "Auntie" },
  { value: "Uncle", label: "Uncle" },
];

const BASE = {
  emoji: "💐",
  heading: "Who's visiting?",
  subtitle: "So everyone can see who's booked a slot.",
  nameLabel: "Your name",
  namePlaceholder: "e.g. Aunt Maria",
  name: "",
  onNameChange: () => {},
  relationshipLabel: "Relationship to baby (optional)",
  relationshipOptions: OPTIONS,
  relationship: "",
  onRelationshipChange: () => {},
  submitLabel: "Continue",
};

describe("ProfileSetup", () => {
  it("renders the heading and subtitle", () => {
    render(<ProfileSetup {...BASE} />);
    expect(screen.getByRole("heading", { name: "Who's visiting?" })).toBeInTheDocument();
    expect(screen.getByText("So everyone can see who's booked a slot.")).toBeInTheDocument();
  });

  it("binds the name field to its value", () => {
    render(<ProfileSetup {...BASE} name="Aunt Maria" />);
    expect(screen.getByLabelText("Your name")).toHaveValue("Aunt Maria");
  });

  it("renders every relationship option", () => {
    render(<ProfileSetup {...BASE} />);
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("calls onSubmit when the form is submitted", async () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(<ProfileSetup {...BASE} name="Aunt Maria" onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("shows a cancel button only when a cancel handler is given", async () => {
    const onCancel = vi.fn();
    render(<ProfileSetup {...BASE} cancelLabel="Cancel" onCancel={onCancel} />);
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("omits the cancel button when there is no cancel handler", () => {
    render(<ProfileSetup {...BASE} />);
    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
  });
});
```

Create `packages/ui/src/screens/MyBookingsTab.test.jsx`:

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MyBookingsTab } from "./MyBookingsTab.jsx";

const BOOKINGS = [
  { id: "2026-08-30_09:00", dateLabel: "Aug 30", atLabel: "at", timeLabel: "9:00 AM", cancelLabel: "Cancel" },
  { id: "2026-08-31_14:00", dateLabel: "Aug 31", atLabel: "at", timeLabel: "2:00 PM", cancelLabel: "Cancel" },
];

describe("MyBookingsTab", () => {
  it("renders the heading", () => {
    render(<MyBookingsTab heading="Your booked visits" bookings={BOOKINGS} />);
    expect(screen.getByRole("heading", { name: "Your booked visits" })).toBeInTheDocument();
  });

  it("renders one row per booking", () => {
    const { container } = render(<MyBookingsTab heading="Your booked visits" bookings={BOOKINGS} />);
    expect(container.querySelectorAll(".booking-row")).toHaveLength(2);
  });

  it("shows the empty state when there are no bookings", () => {
    render(
      <MyBookingsTab heading="Your booked visits" bookings={[]} emptyMessage="You haven’t booked a visit yet." />
    );
    expect(screen.getByText("You haven’t booked a visit yet.")).toHaveClass("empty-state");
  });

  it("calls a booking's own onCancel handler", async () => {
    const onCancel = vi.fn();
    render(
      <MyBookingsTab heading="Your booked visits" bookings={[{ ...BOOKINGS[0], onCancel }]} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- packages/ui/src/screens`
Expected: FAIL — the three modules cannot be resolved.

- [ ] **Step 3: Write the implementations**

Create `packages/ui/src/screens/PinGate.jsx`:

```jsx
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
```

Create `packages/ui/src/screens/ProfileSetup.jsx`:

```jsx
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
```

`maxLength={40}` is transcribed from the original markup in `index.html` — it is a structural field constraint, not product copy.

Create `packages/ui/src/screens/MyBookingsTab.jsx`:

```jsx
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- packages/ui/src/screens`
Expected: PASS, 15 tests.

- [ ] **Step 5: Write the stories**

Create `packages/ui/src/screens/PinGate.stories.jsx`:

```jsx
import { PinGate } from "./PinGate.jsx";

export default {
  title: "Screens/PinGate",
  component: PinGate,
  parameters: { layout: "fullscreen" },
};

const base = {
  emoji: "👶",
  title: "Visit Schedule",
  prompt: "Enter the family passcode to continue.",
  placeholder: "Passcode",
  submitLabel: "Continue",
  value: "",
  onChange: () => {},
  onSubmit: (e) => e.preventDefault(),
};

export const Default = { args: base };
export const WithError = { args: { ...base, error: "That’s not quite right — try again." } };
```

Create `packages/ui/src/screens/ProfileSetup.stories.jsx`:

```jsx
import { ProfileSetup } from "./ProfileSetup.jsx";

const OPTIONS = [
  { value: "", label: "Prefer not to say" },
  { value: "Grandmother", label: "Grandmother" },
  { value: "Auntie", label: "Auntie" },
  { value: "Friend of the family", label: "Friend of the family" },
];

export default {
  title: "Screens/ProfileSetup",
  component: ProfileSetup,
  parameters: { layout: "fullscreen" },
};

const base = {
  emoji: "💐",
  heading: "Who's visiting?",
  subtitle: "So everyone can see who's booked a slot.",
  nameLabel: "Your name",
  namePlaceholder: "e.g. Aunt Maria",
  name: "",
  onNameChange: () => {},
  relationshipLabel: "Relationship to baby (optional)",
  relationshipOptions: OPTIONS,
  relationship: "",
  onRelationshipChange: () => {},
  submitLabel: "Continue",
  onSubmit: (e) => e.preventDefault(),
};

export const FirstTime = { args: base };
export const Editing = {
  args: { ...base, name: "Aunt Maria", relationship: "Auntie", cancelLabel: "Cancel", onCancel: () => {} },
};
```

Create `packages/ui/src/screens/MyBookingsTab.stories.jsx`:

```jsx
import { MyBookingsTab } from "./MyBookingsTab.jsx";

export default {
  title: "Screens/MyBookingsTab",
  component: MyBookingsTab,
  parameters: { layout: "padded" },
};

export const WithBookings = {
  args: {
    heading: "Your booked visits",
    bookings: [
      { id: "a", dateLabel: "Aug 30", atLabel: "at", timeLabel: "9:00 AM", cancelLabel: "Cancel", onCancel: () => {} },
      {
        id: "b",
        dateLabel: "Aug 31",
        atLabel: "at",
        timeLabel: "2:00 PM",
        visitorsLabel: "3 visitors",
        cancelLabel: "Cancel",
        onCancel: () => {},
      },
      { id: "c", dateLabel: "Aug 24", atLabel: "at", timeLabel: "11:00 AM", past: true, cancelLabel: "Cancel" },
    ],
  },
};

export const Empty = {
  args: { heading: "Your booked visits", bookings: [], emptyMessage: "You haven’t booked a visit yet." },
};
```

- [ ] **Step 6: Update the barrel**

Append to `packages/ui/src/index.js`:

```js
export { MyBookingsTab } from "./screens/MyBookingsTab.jsx";
export { PinGate } from "./screens/PinGate.jsx";
export { ProfileSetup } from "./screens/ProfileSetup.jsx";
```

Add the same three names to the array in `packages/ui/src/index.test.js` and update its test name to `"exports all 24 components"`.

- [ ] **Step 7: Run the whole suite**

Run: `npm test`
Expected: PASS, 171 tests (62 core + 109 ui).

- [ ] **Step 8: Verify no passcode leaked into the library**

Run: `grep -rn "firebase\|localStorage\|window\.location\|document\.\|2707" packages/ui/src/ || echo "OK: ui is clean"`
Expected: `OK: ui is clean`

This check matters most for this task: `PinGate` is the component most likely to accidentally acquire the real passcode. Confirm it validates nothing and only reports submissions upward.

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/screens packages/ui/src/index.js packages/ui/src/index.test.js
git commit -m "Add PinGate, ProfileSetup and MyBookingsTab screens to @gv/ui"
```

---

### Task 4: The final three screens — `CalendarTab`, `DayTab`, `BookingModal`

**Files:**
- Create: `packages/ui/src/screens/CalendarTab.jsx`, `DayTab.jsx`, `BookingModal.jsx`
- Create: a `.test.jsx` and a `.stories.jsx` beside each
- Modify: `packages/ui/src/index.js`, `packages/ui/src/index.test.js`

**Interfaces:**
- Consumes: `PagerNav`, `WeekdayRow`, `CalendarGrid`, `LegendBar`, `SlotCard`, `GuestList` (domain); `Modal`, `SelectField`, `Button` (primitives).
- Produces:
  - `CalendarTab({ monthLabel, onPrevMonth, onNextMonth, prevMonthAriaLabel, nextMonthAriaLabel, weekdays, cells, onSelectDay, legendItems })`
  - `DayTab({ dayLabel, onPrevDay, onNextDay, prevDayAriaLabel, nextDayAriaLabel, note, slots })` — `slots` is `Array<{ id: string } & SlotCardProps>`
  - `BookingModal({ title, subtitle, guests, guestsPrefix, visitorLabel, visitorOptions, visitorCount, onVisitorCountChange, onSubmit, submitLabel, onClose })`

- [ ] **Step 1: Write the failing tests**

Create `packages/ui/src/screens/CalendarTab.test.jsx`:

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CalendarTab } from "./CalendarTab.jsx";

const BASE = {
  monthLabel: "August 2026",
  prevMonthAriaLabel: "Previous month",
  nextMonthAriaLabel: "Next month",
  weekdays: ["S", "M", "T", "W", "T", "F", "S"],
  cells: [{ empty: true }, { day: 1, status: "available" }, { day: 2, status: "full" }],
  legendItems: [
    { status: "available", label: "Open" },
    { status: "full", label: "Fully booked" },
  ],
};

describe("CalendarTab", () => {
  it("renders the month label", () => {
    render(<CalendarTab {...BASE} />);
    expect(screen.getByRole("heading", { name: "August 2026" })).toBeInTheDocument();
  });

  it("calls onPrevMonth and onNextMonth", async () => {
    const onPrevMonth = vi.fn();
    const onNextMonth = vi.fn();
    render(<CalendarTab {...BASE} onPrevMonth={onPrevMonth} onNextMonth={onNextMonth} />);
    await userEvent.click(screen.getByRole("button", { name: "Previous month" }));
    await userEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(onPrevMonth).toHaveBeenCalledOnce();
    expect(onNextMonth).toHaveBeenCalledOnce();
  });

  it("renders the weekday row", () => {
    const { container } = render(<CalendarTab {...BASE} />);
    expect(container.querySelectorAll(".weekday-row > span")).toHaveLength(7);
  });

  it("renders the calendar grid cells", () => {
    const { container } = render(<CalendarTab {...BASE} />);
    expect(container.querySelectorAll(".day-cell")).toHaveLength(3);
  });

  it("renders the legend", () => {
    const { container } = render(<CalendarTab {...BASE} />);
    expect(container.querySelectorAll(".legend > span")).toHaveLength(2);
  });

  it("calls onSelectDay with the day number", async () => {
    const onSelectDay = vi.fn();
    render(<CalendarTab {...BASE} onSelectDay={onSelectDay} />);
    await userEvent.click(screen.getByText("1"));
    expect(onSelectDay).toHaveBeenCalledWith(1);
  });
});
```

Create `packages/ui/src/screens/DayTab.test.jsx`:

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DayTab } from "./DayTab.jsx";

const BASE = {
  dayLabel: "Saturday, August 29",
  prevDayAriaLabel: "Previous day",
  nextDayAriaLabel: "Next day",
  slots: [
    { id: "08:30", time: "8:30 AM", statusText: "Past", state: "past" },
    { id: "09:00", time: "9:00 AM", statusText: "3 of 3 spots open", state: "open", actionLabel: "Book" },
    { id: "09:30", time: "9:30 AM", statusText: "Fully booked", state: "full", actionLabel: "Full" },
  ],
};

describe("DayTab", () => {
  it("renders the day label", () => {
    render(<DayTab {...BASE} />);
    expect(screen.getByRole("heading", { name: "Saturday, August 29" })).toBeInTheDocument();
  });

  it("calls onPrevDay and onNextDay", async () => {
    const onPrevDay = vi.fn();
    const onNextDay = vi.fn();
    render(<DayTab {...BASE} onPrevDay={onPrevDay} onNextDay={onNextDay} />);
    await userEvent.click(screen.getByRole("button", { name: "Previous day" }));
    await userEvent.click(screen.getByRole("button", { name: "Next day" }));
    expect(onPrevDay).toHaveBeenCalledOnce();
    expect(onNextDay).toHaveBeenCalledOnce();
  });

  it("renders the note when given", () => {
    render(<DayTab {...BASE} note="Each visit can be up to 3 consecutive slots (1.5 hrs) long." />);
    expect(
      screen.getByText("Each visit can be up to 3 consecutive slots (1.5 hrs) long.")
    ).toHaveClass("day-note");
  });

  it("renders no note element when there is no note", () => {
    const { container } = render(<DayTab {...BASE} />);
    expect(container.querySelector(".day-note")).toBeNull();
  });

  it("renders one slot card per slot", () => {
    const { container } = render(<DayTab {...BASE} />);
    expect(container.querySelectorAll(".slot-card")).toHaveLength(3);
  });

  it("wraps the slots in a slot-list", () => {
    const { container } = render(<DayTab {...BASE} />);
    expect(container.querySelector(".slot-list")).toBeInTheDocument();
  });

  it("calls a slot's own onBook handler", async () => {
    const onBook = vi.fn();
    const slots = [{ ...BASE.slots[1], onBook }];
    render(<DayTab {...BASE} slots={slots} />);
    await userEvent.click(screen.getByRole("button", { name: "Book" }));
    expect(onBook).toHaveBeenCalledOnce();
  });
});
```

Create `packages/ui/src/screens/BookingModal.test.jsx`:

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BookingModal } from "./BookingModal.jsx";

const BASE = {
  title: "Book this slot",
  subtitle: "Saturday, August 29 at 9:00 AM",
  visitorLabel: "Number of visitors (incl. you)",
  visitorOptions: [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
  ],
  visitorCount: "1",
  onVisitorCountChange: () => {},
  submitLabel: "Confirm booking",
  onClose: () => {},
};

describe("BookingModal", () => {
  it("renders the title and subtitle", () => {
    render(<BookingModal {...BASE} />);
    expect(screen.getByRole("heading", { name: "Book this slot" })).toBeInTheDocument();
    expect(screen.getByText("Saturday, August 29 at 9:00 AM")).toBeInTheDocument();
  });

  it("renders existing guests as inline text behind the prefix", () => {
    render(
      <BookingModal
        {...BASE}
        guests={[{ name: "Aunt Maria", relationship: "Auntie" }]}
        guestsPrefix="Already booked: "
      />
    );
    expect(screen.getByText("Already booked: Aunt Maria (Auntie)")).toBeInTheDocument();
  });

  it("renders no guest line when the slot is empty", () => {
    const { container } = render(<BookingModal {...BASE} guests={[]} />);
    expect(container.querySelector(".modal-guests")).toBeNull();
  });

  it("renders one option per visitor count", () => {
    render(<BookingModal {...BASE} />);
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("calls onSubmit when the form is submitted", async () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(<BookingModal {...BASE} onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("button", { name: "Confirm booking" }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("calls onClose from the close button", async () => {
    const onClose = vi.fn();
    render(<BookingModal {...BASE} onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- packages/ui/src/screens`
Expected: FAIL — the three new modules cannot be resolved. Task 3's 15 tests still pass.

- [ ] **Step 3: Write the implementations**

Create `packages/ui/src/screens/CalendarTab.jsx`:

```jsx
import { CalendarGrid } from "../domain/CalendarGrid.jsx";
import { LegendBar } from "../domain/LegendBar.jsx";
import { PagerNav } from "../domain/PagerNav.jsx";
import { WeekdayRow } from "../domain/WeekdayRow.jsx";

export function CalendarTab({
  monthLabel,
  onPrevMonth,
  onNextMonth,
  prevMonthAriaLabel,
  nextMonthAriaLabel,
  weekdays = [],
  cells = [],
  onSelectDay,
  legendItems = [],
}) {
  return (
    <div className="tab-panel">
      <PagerNav
        label={monthLabel}
        onPrev={onPrevMonth}
        onNext={onNextMonth}
        prevAriaLabel={prevMonthAriaLabel}
        nextAriaLabel={nextMonthAriaLabel}
      />
      <WeekdayRow days={weekdays} />
      <CalendarGrid cells={cells} onSelectDay={onSelectDay} />
      <LegendBar items={legendItems} />
    </div>
  );
}
```

Create `packages/ui/src/screens/DayTab.jsx`:

```jsx
import { PagerNav } from "../domain/PagerNav.jsx";
import { SlotCard } from "../domain/SlotCard.jsx";

export function DayTab({
  dayLabel,
  onPrevDay,
  onNextDay,
  prevDayAriaLabel,
  nextDayAriaLabel,
  note,
  slots = [],
}) {
  return (
    <div className="tab-panel">
      <PagerNav
        label={dayLabel}
        onPrev={onPrevDay}
        onNext={onNextDay}
        prevAriaLabel={prevDayAriaLabel}
        nextAriaLabel={nextDayAriaLabel}
      />
      {note && <p className="muted day-note">{note}</p>}
      <div className="slot-list">
        {slots.map(({ id, ...slot }) => (
          <SlotCard key={id} {...slot} />
        ))}
      </div>
    </div>
  );
}
```

The note carries both `muted` and `day-note`, matching the original markup in `index.html`.

Create `packages/ui/src/screens/BookingModal.jsx`:

```jsx
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- packages/ui/src/screens`
Expected: PASS, 35 tests (15 from Task 3 + 20 new).

- [ ] **Step 5: Write the stories**

Create `packages/ui/src/screens/CalendarTab.stories.jsx`:

```jsx
import { CalendarTab } from "./CalendarTab.jsx";

const CELLS = [
  ...Array.from({ length: 6 }, () => ({ empty: true })),
  ...Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    const status = day % 7 === 0 ? "full" : day % 3 === 0 ? "limited" : "available";
    return { day, status, past: day < 29, today: day === 29, selected: day === 29 };
  }),
];

export default {
  title: "Screens/CalendarTab",
  component: CalendarTab,
  parameters: { layout: "padded" },
};

export const August = {
  args: {
    monthLabel: "August 2026",
    prevMonthAriaLabel: "Previous month",
    nextMonthAriaLabel: "Next month",
    weekdays: ["S", "M", "T", "W", "T", "F", "S"],
    cells: CELLS,
    onSelectDay: () => {},
    onPrevMonth: () => {},
    onNextMonth: () => {},
    legendItems: [
      { status: "available", label: "Open" },
      { status: "limited", label: "Filling up" },
      { status: "full", label: "Fully booked" },
    ],
  },
};
```

Create `packages/ui/src/screens/DayTab.stories.jsx`:

```jsx
import { DayTab } from "./DayTab.jsx";

export default {
  title: "Screens/DayTab",
  component: DayTab,
  parameters: { layout: "padded" },
};

export const MixedDay = {
  args: {
    dayLabel: "Saturday, August 29",
    prevDayAriaLabel: "Previous day",
    nextDayAriaLabel: "Next day",
    onPrevDay: () => {},
    onNextDay: () => {},
    note: "Each visit can be up to 3 consecutive slots (1.5 hrs) long.",
    slots: [
      { id: "08:30", time: "8:30 AM", statusText: "Past", state: "past" },
      { id: "09:00", time: "9:00 AM", statusText: "3 of 3 spots open", state: "open", actionLabel: "Book", onBook: () => {} },
      {
        id: "09:30",
        time: "9:30 AM",
        statusText: "1 of 3 spots open",
        state: "open",
        actionLabel: "Book",
        onBook: () => {},
        guests: [{ name: "Aunt Maria", relationship: "Auntie", visitorCount: 2 }],
      },
      {
        id: "10:00",
        time: "10:00 AM",
        statusText: "1 of 3 spots open",
        state: "mine",
        actionLabel: "Cancel your visit",
        onCancel: () => {},
        guests: [{ name: "You", visitorCount: 2 }],
      },
      {
        id: "10:30",
        time: "10:30 AM",
        statusText: "Fully booked",
        state: "full",
        actionLabel: "Full",
        guests: [{ name: "Grandma", relationship: "Grandmother", visitorCount: 3 }],
      },
      {
        id: "11:00",
        time: "11:00 AM",
        statusText: "3 of 3 spots open",
        state: "blocked",
        actionLabel: "Too long a visit",
        actionTitle: "Booking this would make a run of more than 3 consecutive slots for you",
      },
    ],
  },
};
```

Create `packages/ui/src/screens/BookingModal.stories.jsx`:

```jsx
import { BookingModal } from "./BookingModal.jsx";

export default {
  title: "Screens/BookingModal",
  component: BookingModal,
  parameters: { layout: "fullscreen" },
};

const base = {
  title: "Book this slot",
  subtitle: "Saturday, August 29 at 9:00 AM",
  visitorLabel: "Number of visitors (incl. you)",
  visitorOptions: [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
  ],
  visitorCount: "1",
  onVisitorCountChange: () => {},
  submitLabel: "Confirm booking",
  onSubmit: (e) => e.preventDefault(),
  onClose: () => {},
};

export const EmptySlot = { args: base };
export const PartiallyBooked = {
  args: {
    ...base,
    subtitle: "Saturday, August 29 at 9:30 AM",
    guests: [{ name: "Aunt Maria", relationship: "Auntie" }],
    guestsPrefix: "Already booked: ",
    visitorOptions: [{ value: "1", label: "1" }],
  },
};
```

- [ ] **Step 6: Update the barrel**

Append to `packages/ui/src/index.js`:

```js
export { BookingModal } from "./screens/BookingModal.jsx";
export { CalendarTab } from "./screens/CalendarTab.jsx";
export { DayTab } from "./screens/DayTab.jsx";
```

Add the same three names to the array in `packages/ui/src/index.test.js` and update its test name to `"exports all 27 components"`.

- [ ] **Step 7: Run the whole suite**

Run: `npm test`
Expected: PASS, 191 tests (62 core + 129 ui).

- [ ] **Step 8: Verify the full done-bar**

Run: `grep -rn "firebase\|localStorage\|window\.location\|document\.\|2707" packages/ui/src/ || echo "OK: ui is clean"`
Expected: `OK: ui is clean`

Run: `node -e "const p=require('./packages/ui/package.json'); const d=Object.keys(p.dependencies||{}); if(d.some(x=>x.includes('firebase'))){console.error('FAIL');process.exit(1)} console.log('OK: ui deps =',d.join(','))"`
Expected: `OK: ui deps = @gv/core`

Run: `npm run build`
Expected: succeeds. Confirm `packages/ui/dist/gv-ui.js` exports all 27 components.

Run: `npm run build-storybook --workspace @gv/ui`
Expected: succeeds. Report the total story count.

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/screens packages/ui/src/index.js packages/ui/src/index.test.js
git commit -m "Add CalendarTab, DayTab and BookingModal screens to @gv/ui"
```

---

## Phase 2B done-bar

- `npm test` passes: 191 tests (62 core + 129 ui).
- `npm run build` produces `packages/ui/dist/gv-ui.js` exporting all 27 components.
- `npm run build-storybook --workspace @gv/ui` succeeds with stories for all 27.
- `packages/ui/package.json` `dependencies` contains only `@gv/core`.
- No `firebase`, `localStorage`, `window.location`, `document.`, or the passcode string anywhere under `packages/ui/src/`.
- The root `js/`, `css/`, and `index.html` are unchanged and the existing app still works.

## What Phase 2B deliberately does not do

- Does not touch `js/app.js` or the live app. Phase 3 does the React port.
- Does not self-host fonts. `styles.css` still pulls Quicksand and Inter from Google Fonts over the network; Phase 4 replaces that with a local `fonts/` directory before any design-sync upload.
- Does not run `/design-sync`. Nothing is uploaded anywhere in this phase.
- Does not add TypeScript definitions. design-sync generates `.d.ts` files from the built bundle in Phase 4.
