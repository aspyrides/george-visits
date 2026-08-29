# Phase 1: Workspace + `core` Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the npm workspaces monorepo and extract the app's pure logic into a dependency-free, fully tested `@gv/core` package.

**Architecture:** Three workspaces will eventually live under `packages/`; this phase creates the workspace root and the first of them, `core`. `core` holds the date, slot, and booking-rule logic currently trapped as module-scope functions in `js/app.js`. Every function that today reads the module-global `CONFIG` takes configuration as an explicit parameter instead, and every function that today reads `new Date()` takes an injectable `now`. This is what makes the logic testable and what keeps `core` free of dependencies.

**Tech Stack:** Node 20+, npm workspaces, ES modules, Vitest.

**Spec:** `docs/superpowers/specs/2026-08-29-design-system-extraction-design.md`

## Global Constraints

- Branch is `design-system`. Never commit to `main`.
- `packages/core` has **zero** runtime dependencies. Its `package.json` `dependencies` field stays empty. No React, no DOM APIs, no Firebase, no `localStorage`.
- All packages are ES modules: `"type": "module"` in every `package.json`.
- Package names are scoped: `@gv/core`, `@gv/ui`, `@gv/app`. All are `"private": true` — nothing is published to npm.
- Behavior preservation: extracted functions must produce identical output to their `js/app.js` originals for all inputs the app can produce. This is a port, not a redesign.
- The existing `js/`, `css/`, and `index.html` at the repo root are **not deleted or modified in this phase**. They keep working. They are removed in Phase 3 when `packages/app` replaces them.
- Booking error codes are exactly the three strings already thrown today: `FULL`, `ALREADY_BOOKED`, `RUN_LIMIT`. Do not rename them — `firestore.rules` and existing client behavior depend on nothing else, but the app's copy mapping keys off them.
- Node's `Date` is locale- and timezone-sensitive. Tests must never depend on the machine's timezone or locale. Use explicit `now` arguments and explicit locale arguments.

---

### Task 1: Workspace scaffolding + `core/src/dates.js`

Creates the monorepo root and the first `core` module. Scaffolding is folded in here because the test runner is what makes this task's deliverable verifiable.

**Files:**
- Create: `package.json`
- Create: `packages/core/package.json`
- Create: `packages/core/src/dates.js`
- Create: `packages/core/src/dates.test.js`
- Create: `.gitignore`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `pad2(n: number) => string` — zero-pads to 2 digits
  - `toISODate(d: Date) => string` — `"YYYY-MM-DD"`, local time
  - `fromISODate(s: string) => Date` — local midnight
  - `addDays(d: Date, n: number) => Date`
  - `addMonths(d: Date, n: number) => Date` — first of the resulting month
  - `isSameDay(a: Date, b: Date) => boolean`
  - `isPastDay(d: Date, now?: Date) => boolean` — `now` defaults to `new Date()`
  - `formatDayLabel(d: Date, locale?: string) => string` — e.g. `"Saturday, August 29"`
  - `formatDayShort(d: Date, locale?: string) => string` — e.g. `"Aug 29"`

- [ ] **Step 1: Create the workspace root**

Create `package.json`:

```json
{
  "name": "george-visits",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "workspaces": ["packages/*"],
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "vitest": "^2.1.0"
  }
}
```

Create `.gitignore`:

```
node_modules/
dist/
storybook-static/
ds-bundle/
.ds-sync/
*.log
```

- [ ] **Step 2: Create the core package manifest**

Create `packages/core/package.json`:

```json
{
  "name": "@gv/core",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.js",
  "exports": {
    ".": "./src/index.js"
  },
  "dependencies": {}
}
```

Note the empty `dependencies`. This is load-bearing — it is the structural
guarantee that `core` stays pure. Do not add to it.

- [ ] **Step 3: Install**

Run: `npm install`
Expected: succeeds, creates `node_modules/` and `package-lock.json`, and
`node_modules/@gv/core` exists as a symlink to `packages/core`.

- [ ] **Step 4: Write the failing test**

Create `packages/core/src/dates.test.js`:

```js
import { describe, it, expect } from "vitest";
import {
  pad2,
  toISODate,
  fromISODate,
  addDays,
  addMonths,
  isSameDay,
  isPastDay,
  formatDayLabel,
  formatDayShort,
} from "./dates.js";

describe("pad2", () => {
  it("pads single digits", () => {
    expect(pad2(1)).toBe("01");
  });
  it("leaves two digits alone", () => {
    expect(pad2(12)).toBe("12");
  });
});

describe("toISODate", () => {
  it("formats a date as YYYY-MM-DD in local time", () => {
    expect(toISODate(new Date(2026, 7, 29))).toBe("2026-08-29");
  });
  it("pads single-digit months and days", () => {
    expect(toISODate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("fromISODate", () => {
  it("parses to local midnight", () => {
    const d = fromISODate("2026-08-29");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(7);
    expect(d.getDate()).toBe(29);
    expect(d.getHours()).toBe(0);
  });
  it("round-trips with toISODate", () => {
    expect(toISODate(fromISODate("2026-02-01"))).toBe("2026-02-01");
  });
});

describe("addDays", () => {
  it("adds days", () => {
    expect(toISODate(addDays(new Date(2026, 7, 29), 3))).toBe("2026-09-01");
  });
  it("subtracts with a negative count", () => {
    expect(toISODate(addDays(new Date(2026, 7, 1), -1))).toBe("2026-07-31");
  });
  it("does not mutate its argument", () => {
    const d = new Date(2026, 7, 29);
    addDays(d, 5);
    expect(toISODate(d)).toBe("2026-08-29");
  });
});

describe("addMonths", () => {
  it("returns the first of the resulting month", () => {
    expect(toISODate(addMonths(new Date(2026, 7, 29), 1))).toBe("2026-09-01");
  });
  it("crosses a year boundary", () => {
    expect(toISODate(addMonths(new Date(2026, 11, 15), 1))).toBe("2027-01-01");
  });
  it("goes backwards", () => {
    expect(toISODate(addMonths(new Date(2026, 0, 15), -1))).toBe("2025-12-01");
  });
});

describe("isSameDay", () => {
  it("is true for the same calendar day at different times", () => {
    expect(isSameDay(new Date(2026, 7, 29, 1), new Date(2026, 7, 29, 23))).toBe(true);
  });
  it("is false for different days", () => {
    expect(isSameDay(new Date(2026, 7, 29), new Date(2026, 7, 30))).toBe(false);
  });
});

describe("isPastDay", () => {
  const now = new Date(2026, 7, 29, 12, 0);
  it("is false for today, regardless of time of day", () => {
    expect(isPastDay(new Date(2026, 7, 29, 23, 59), now)).toBe(false);
  });
  it("is true for yesterday", () => {
    expect(isPastDay(new Date(2026, 7, 28), now)).toBe(true);
  });
  it("is false for tomorrow", () => {
    expect(isPastDay(new Date(2026, 7, 30), now)).toBe(false);
  });
});

describe("formatDayLabel", () => {
  it("renders weekday, month and day", () => {
    expect(formatDayLabel(new Date(2026, 7, 29), "en-US")).toBe("Saturday, August 29");
  });
});

describe("formatDayShort", () => {
  it("renders abbreviated month and day", () => {
    expect(formatDayShort(new Date(2026, 7, 29), "en-US")).toBe("Aug 29");
  });
});
```

- [ ] **Step 5: Run test to verify it fails**

Run: `npm test -- packages/core/src/dates.test.js`
Expected: FAIL — cannot resolve `./dates.js`.

- [ ] **Step 6: Write the implementation**

Create `packages/core/src/dates.js`:

```js
export const pad2 = (n) => String(n).padStart(2, "0");

export function toISODate(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function fromISODate(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function addMonths(d, n) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

export function isSameDay(a, b) {
  return a.toDateString() === b.toDateString();
}

export function isPastDay(d, now = new Date()) {
  const t = new Date(now);
  t.setHours(0, 0, 0, 0);
  const dd = new Date(d);
  dd.setHours(0, 0, 0, 0);
  return dd < t;
}

export function formatDayLabel(d, locale = undefined) {
  return d.toLocaleDateString(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatDayShort(d, locale = undefined) {
  return d.toLocaleDateString(locale, { month: "short", day: "numeric" });
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npm test -- packages/core/src/dates.test.js`
Expected: PASS, 19 tests.

- [ ] **Step 8: Commit**

```bash
git add package.json .gitignore packages/core/package.json packages/core/src/dates.js packages/core/src/dates.test.js
git commit -m "Add npm workspace root and @gv/core date helpers"
```

---

### Task 2: `core/src/slots.js`

**Files:**
- Create: `packages/core/src/slots.js`
- Create: `packages/core/src/slots.test.js`

**Interfaces:**
- Consumes: `pad2`, `fromISODate` from `./dates.js` (Task 1).
- Produces:
  - `timeToMinutes(t: string) => number` — `"08:30"` → `510`
  - `minutesToTime(mins: number) => string` — `510` → `"08:30"`
  - `generateSlotTimes(cfg: { dayStart: string, dayEnd: string, slotMinutes: number }) => string[]` — start inclusive, end exclusive
  - `formatTime12h(t: string) => string` — `"08:30"` → `"8:30 AM"`
  - `isPastSlot(dateISO: string, timeStr: string, now?: Date) => boolean`

Note the signature change from the original: `generateSlotTimes` took no
arguments and read the module-global `CONFIG`. It now takes config explicitly.

- [ ] **Step 1: Write the failing test**

Create `packages/core/src/slots.test.js`:

```js
import { describe, it, expect } from "vitest";
import {
  timeToMinutes,
  minutesToTime,
  generateSlotTimes,
  formatTime12h,
  isPastSlot,
} from "./slots.js";

const CFG = { dayStart: "08:30", dayEnd: "18:30", slotMinutes: 30 };

describe("timeToMinutes", () => {
  it("converts midnight", () => {
    expect(timeToMinutes("00:00")).toBe(0);
  });
  it("converts a morning time", () => {
    expect(timeToMinutes("08:30")).toBe(510);
  });
  it("converts an evening time", () => {
    expect(timeToMinutes("18:30")).toBe(1110);
  });
});

describe("minutesToTime", () => {
  it("formats with zero padding", () => {
    expect(minutesToTime(510)).toBe("08:30");
  });
  it("round-trips with timeToMinutes", () => {
    expect(minutesToTime(timeToMinutes("14:00"))).toBe("14:00");
  });
});

describe("generateSlotTimes", () => {
  const slots = generateSlotTimes(CFG);

  it("starts at dayStart", () => {
    expect(slots[0]).toBe("08:30");
  });
  it("excludes dayEnd", () => {
    expect(slots).not.toContain("18:30");
    expect(slots[slots.length - 1]).toBe("18:00");
  });
  it("produces one slot per slotMinutes across the window", () => {
    expect(slots).toHaveLength(20);
  });
  it("respects a different interval", () => {
    expect(generateSlotTimes({ dayStart: "09:00", dayEnd: "10:00", slotMinutes: 15 }))
      .toEqual(["09:00", "09:15", "09:30", "09:45"]);
  });
  it("returns empty when the window is inverted", () => {
    expect(generateSlotTimes({ dayStart: "18:00", dayEnd: "09:00", slotMinutes: 30 })).toEqual([]);
  });
});

describe("formatTime12h", () => {
  it("formats morning", () => {
    expect(formatTime12h("08:30")).toBe("8:30 AM");
  });
  it("formats afternoon", () => {
    expect(formatTime12h("13:00")).toBe("1:00 PM");
  });
  it("formats noon as 12 PM", () => {
    expect(formatTime12h("12:00")).toBe("12:00 PM");
  });
  it("formats midnight as 12 AM", () => {
    expect(formatTime12h("00:00")).toBe("12:00 AM");
  });
});

describe("isPastSlot", () => {
  const now = new Date(2026, 7, 29, 12, 0);

  it("is true for an earlier slot today", () => {
    expect(isPastSlot("2026-08-29", "11:30", now)).toBe(true);
  });
  it("is false for a later slot today", () => {
    expect(isPastSlot("2026-08-29", "12:30", now)).toBe(false);
  });
  it("is true for any slot yesterday", () => {
    expect(isPastSlot("2026-08-28", "23:30", now)).toBe(true);
  });
  it("is false for any slot tomorrow", () => {
    expect(isPastSlot("2026-08-30", "00:00", now)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- packages/core/src/slots.test.js`
Expected: FAIL — cannot resolve `./slots.js`.

- [ ] **Step 3: Write the implementation**

Create `packages/core/src/slots.js`:

```js
import { pad2, fromISODate } from "./dates.js";

export function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(mins) {
  return `${pad2(Math.floor(mins / 60))}:${pad2(mins % 60)}`;
}

export function generateSlotTimes({ dayStart, dayEnd, slotMinutes }) {
  const start = timeToMinutes(dayStart);
  const end = timeToMinutes(dayEnd);
  const slots = [];
  for (let t = start; t < end; t += slotMinutes) slots.push(minutesToTime(t));
  return slots;
}

export function formatTime12h(t) {
  const [h, m] = t.split(":").map(Number);
  const period = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad2(m)} ${period}`;
}

export function isPastSlot(dateISO, timeStr, now = new Date()) {
  const slotDate = fromISODate(dateISO);
  const [h, m] = timeStr.split(":").map(Number);
  slotDate.setHours(h, m, 0, 0);
  return slotDate.getTime() < now.getTime();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- packages/core/src/slots.test.js`
Expected: PASS, 18 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/slots.js packages/core/src/slots.test.js
git commit -m "Add @gv/core slot time helpers"
```

---

### Task 3: `core/src/rules.js` — the consecutive-slot rule

This is the app's subtlest logic and currently has no tests at all. The
original is at `js/app.js:87-119`.

The rule: a person may hold multiple separate blocks of slots on the same day,
but no single unbroken block may exceed `maxConsecutiveSlots`. "Unbroken" means
consecutive times exactly `slotMinutes` apart.

**Files:**
- Create: `packages/core/src/rules.js`
- Create: `packages/core/src/rules.test.js`

**Interfaces:**
- Consumes: `timeToMinutes` from `./slots.js` (Task 2).
- Produces:
  - `runLengthAt(sortedTimes: string[], time: string, slotMinutes: number) => number`
  - `checkConsecutiveRule(existingTimesSorted: string[], time: string, cfg: { slotMinutes: number, maxConsecutiveSlots: number }) => { allowed: boolean, reason?: "ALREADY_BOOKED" | "RUN_LIMIT" }`

Signature change from the original: both functions took config from module
scope; they now take it explicitly. `runLengthAt` gained a third parameter.

- [ ] **Step 1: Write the failing test**

Create `packages/core/src/rules.test.js`:

```js
import { describe, it, expect } from "vitest";
import { runLengthAt, checkConsecutiveRule } from "./rules.js";

const CFG = { slotMinutes: 30, maxConsecutiveSlots: 3 };

describe("runLengthAt", () => {
  it("is 1 for a lone slot", () => {
    expect(runLengthAt(["09:00"], "09:00", 30)).toBe(1);
  });
  it("counts a run extending forwards", () => {
    expect(runLengthAt(["09:00", "09:30", "10:00"], "09:00", 30)).toBe(3);
  });
  it("counts a run extending backwards", () => {
    expect(runLengthAt(["09:00", "09:30", "10:00"], "10:00", 30)).toBe(3);
  });
  it("counts a run from the middle", () => {
    expect(runLengthAt(["09:00", "09:30", "10:00"], "09:30", 30)).toBe(3);
  });
  it("does not count across a gap", () => {
    expect(runLengthAt(["09:00", "09:30", "11:00"], "11:00", 30)).toBe(1);
  });
  it("counts only the run containing the target", () => {
    expect(runLengthAt(["09:00", "09:30", "11:00", "11:30", "12:00"], "09:00", 30)).toBe(2);
  });
});

describe("checkConsecutiveRule", () => {
  it("allows a booking on an empty day", () => {
    expect(checkConsecutiveRule([], "09:00", CFG)).toEqual({ allowed: true });
  });

  it("allows a non-adjacent second booking", () => {
    expect(checkConsecutiveRule(["09:00"], "14:00", CFG)).toEqual({ allowed: true });
  });

  it("rejects a slot already booked", () => {
    expect(checkConsecutiveRule(["09:00"], "09:00", CFG)).toEqual({
      allowed: false,
      reason: "ALREADY_BOOKED",
    });
  });

  it("allows extending a run to exactly the limit", () => {
    expect(checkConsecutiveRule(["09:00", "09:30"], "10:00", CFG)).toEqual({ allowed: true });
  });

  it("rejects extending a run past the limit", () => {
    expect(checkConsecutiveRule(["09:00", "09:30", "10:00"], "10:30", CFG)).toEqual({
      allowed: false,
      reason: "RUN_LIMIT",
    });
  });

  it("rejects extending a run backwards past the limit", () => {
    expect(checkConsecutiveRule(["09:30", "10:00", "10:30"], "09:00", CFG)).toEqual({
      allowed: false,
      reason: "RUN_LIMIT",
    });
  });

  // The bridging case: two separate legal runs joined by one booking into a
  // single illegal run. This is the case most likely to regress.
  it("rejects a booking that bridges two runs into an over-length one", () => {
    expect(checkConsecutiveRule(["09:00", "09:30", "10:30", "11:00"], "10:00", CFG)).toEqual({
      allowed: false,
      reason: "RUN_LIMIT",
    });
  });

  it("allows a booking that bridges two runs within the limit", () => {
    expect(checkConsecutiveRule(["09:00", "10:00"], "09:30", CFG)).toEqual({ allowed: true });
  });

  it("allows multiple separate blocks in one day", () => {
    expect(checkConsecutiveRule(["09:00", "09:30", "10:00", "14:00"], "14:30", CFG)).toEqual({
      allowed: true,
    });
  });

  it("respects a different limit", () => {
    expect(
      checkConsecutiveRule(["09:00"], "09:30", { slotMinutes: 30, maxConsecutiveSlots: 1 })
    ).toEqual({ allowed: false, reason: "RUN_LIMIT" });
  });

  it("does not mutate the input array", () => {
    const existing = ["09:00", "09:30"];
    checkConsecutiveRule(existing, "10:00", CFG);
    expect(existing).toEqual(["09:00", "09:30"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- packages/core/src/rules.test.js`
Expected: FAIL — cannot resolve `./rules.js`.

- [ ] **Step 3: Write the implementation**

Create `packages/core/src/rules.js`:

```js
import { timeToMinutes } from "./slots.js";

// Length of the unbroken run of back-to-back slot times (in `sortedTimes`)
// that contains `time`, where "back-to-back" means exactly slotMinutes apart.
export function runLengthAt(sortedTimes, time, slotMinutes) {
  const idx = sortedTimes.indexOf(time);
  if (idx === -1) return 0;

  let start = idx;
  while (
    start > 0 &&
    timeToMinutes(sortedTimes[start]) - timeToMinutes(sortedTimes[start - 1]) === slotMinutes
  ) {
    start--;
  }

  let end = idx;
  while (
    end < sortedTimes.length - 1 &&
    timeToMinutes(sortedTimes[end + 1]) - timeToMinutes(sortedTimes[end]) === slotMinutes
  ) {
    end++;
  }

  return end - start + 1;
}

// A person can hold multiple separate blocks of slots on the same day, but
// no single unbroken block may exceed maxConsecutiveSlots.
export function checkConsecutiveRule(existingTimesSorted, time, { slotMinutes, maxConsecutiveSlots }) {
  if (existingTimesSorted.includes(time)) {
    return { allowed: false, reason: "ALREADY_BOOKED" };
  }
  const merged = [...existingTimesSorted, time].sort();
  if (runLengthAt(merged, time, slotMinutes) > maxConsecutiveSlots) {
    return { allowed: false, reason: "RUN_LIMIT" };
  }
  return { allowed: true };
}
```

Note: `runLengthAt` gained an `idx === -1` guard the original lacked. The
original would compute a nonsense run length if handed a time not present in
the array. No caller does that today, but the guard makes the function honest
on its own terms.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- packages/core/src/rules.test.js`
Expected: PASS, 17 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/rules.js packages/core/src/rules.test.js
git commit -m "Add @gv/core consecutive-slot rule with full test coverage"
```

---

### Task 4: `core/src/errors.js` and the package barrel

**Files:**
- Create: `packages/core/src/errors.js`
- Create: `packages/core/src/errors.test.js`
- Create: `packages/core/src/index.js`
- Create: `packages/core/src/index.test.js`

**Interfaces:**
- Consumes: every module from Tasks 1-3.
- Produces:
  - `BOOKING_ERRORS: { FULL: "FULL", ALREADY_BOOKED: "ALREADY_BOOKED", RUN_LIMIT: "RUN_LIMIT" }` — frozen
  - `isBookingErrorCode(code: unknown) => boolean`
  - `@gv/core` barrel re-exporting everything from `dates.js`, `slots.js`, `rules.js`, `errors.js`

- [ ] **Step 1: Write the failing tests**

Create `packages/core/src/errors.test.js`:

```js
import { describe, it, expect } from "vitest";
import { BOOKING_ERRORS, isBookingErrorCode } from "./errors.js";

describe("BOOKING_ERRORS", () => {
  it("carries the three codes the app throws today", () => {
    expect(BOOKING_ERRORS).toEqual({
      FULL: "FULL",
      ALREADY_BOOKED: "ALREADY_BOOKED",
      RUN_LIMIT: "RUN_LIMIT",
    });
  });

  it("is frozen", () => {
    expect(Object.isFrozen(BOOKING_ERRORS)).toBe(true);
  });
});

describe("isBookingErrorCode", () => {
  it("accepts known codes", () => {
    expect(isBookingErrorCode("FULL")).toBe(true);
    expect(isBookingErrorCode("RUN_LIMIT")).toBe(true);
  });
  it("rejects anything else", () => {
    expect(isBookingErrorCode("BOOM")).toBe(false);
    expect(isBookingErrorCode(undefined)).toBe(false);
  });
});
```

Create `packages/core/src/index.test.js`:

```js
import { describe, it, expect } from "vitest";
import * as core from "./index.js";

describe("@gv/core barrel", () => {
  it("re-exports the public surface", () => {
    for (const name of [
      "pad2",
      "toISODate",
      "fromISODate",
      "addDays",
      "addMonths",
      "isSameDay",
      "isPastDay",
      "formatDayLabel",
      "formatDayShort",
      "timeToMinutes",
      "minutesToTime",
      "generateSlotTimes",
      "formatTime12h",
      "isPastSlot",
      "runLengthAt",
      "checkConsecutiveRule",
      "BOOKING_ERRORS",
      "isBookingErrorCode",
    ]) {
      expect(core[name], `missing export: ${name}`).toBeDefined();
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- packages/core/src/errors.test.js packages/core/src/index.test.js`
Expected: FAIL — cannot resolve `./errors.js` and `./index.js`.

- [ ] **Step 3: Write the implementation**

Create `packages/core/src/errors.js`:

```js
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
```

Create `packages/core/src/index.js`:

```js
export * from "./dates.js";
export * from "./slots.js";
export * from "./rules.js";
export * from "./errors.js";
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- packages/core/src/errors.test.js packages/core/src/index.test.js`
Expected: PASS, 5 tests.

- [ ] **Step 5: Run the whole suite**

Run: `npm test`
Expected: PASS, 59 tests across 5 files.

- [ ] **Step 6: Verify core really is dependency-free**

Run: `node -e "const p=require('./packages/core/package.json'); const d=Object.keys(p.dependencies||{}); if(d.length){console.error('FAIL: core has dependencies:',d); process.exit(1)} console.log('OK: core has no dependencies')"`
Expected: `OK: core has no dependencies`

Run: `grep -rn "firebase\|localStorage\|document\.\|window\." packages/core/src/ || echo "OK: no DOM or Firebase references"`
Expected: `OK: no DOM or Firebase references`

- [ ] **Step 7: Commit**

```bash
git add packages/core/src/errors.js packages/core/src/errors.test.js packages/core/src/index.js packages/core/src/index.test.js
git commit -m "Add @gv/core error codes and package barrel"
```

---

## Phase 1 done-bar

- `npm install` succeeds from a clean checkout.
- `npm test` passes with 59 tests across 5 files.
- `packages/core/package.json` has empty `dependencies`.
- No DOM, Firebase, or `localStorage` reference anywhere in `packages/core/src/`.
- The root `js/`, `css/`, and `index.html` are unchanged and the existing app still works when opened.

## What Phase 1 deliberately does not do

- Does not touch `js/app.js`. The old code keeps running unchanged; `core` is
  a parallel extraction, verified by tests, not yet consumed by anything.
  Deleting the originals happens in Phase 3, when `packages/app` replaces them.
- Does not create `packages/ui` or `packages/app`.
- Does not add React, Vite, or Storybook.
