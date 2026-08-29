# Phase 2A: `ui` Foundation + Primitives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up `@gv/ui` — the React component library — with its stylesheet, Vite lib build, Storybook, and all 11 primitive components.

**Architecture:** `packages/ui` is a React 19 component library built by Vite in lib mode. Its stylesheet is a normalized copy of the existing `css/style.css`, split into `tokens.css` (the 13 custom properties) and `components.css` (everything else), reachable from a single `styles.css` via `@import`. Every component is a pure function of props — no Firebase, no data fetching, no module state. Storybook renders each component in isolation and is the source design-sync later uses for verified previews.

**Tech Stack:** React 19, Vite 6 (lib mode), Storybook 8 (`@storybook/react-vite`), Vitest + `@testing-library/react` + jsdom.

**Spec:** `docs/superpowers/specs/2026-08-29-design-system-extraction-design.md`

## Global Constraints

- Branch is `design-system`. Never commit to `main`.
- **`packages/ui` must NOT depend on `firebase`.** Its `package.json` `dependencies` may contain only `@gv/core`. `react` and `react-dom` are `peerDependencies` + `devDependencies`. This is the spec's central structural invariant: a component that reads live data renders broken in Claude Design.
- **No component may read `localStorage`, `window.location`, `document` directly, or perform any I/O.** Every component is a pure function of its props.
- **No product copy or configuration inside `packages/ui`.** No passcode, no `CONFIG` import, no user-facing message strings baked into components — those arrive as props. The family passcode (`js/config.js` `appPin`) must never appear anywhere under `packages/ui`.
- All packages are ES modules (`"type": "module"`), scoped and `"private": true`.
- The repo-root `js/`, `css/`, and `index.html` must NOT be modified or deleted in this phase. The live app keeps running on them until Phase 3.
- `packages/core` must keep zero runtime dependencies and its 62 tests must keep passing.
- CSS class names are the library's public styling vocabulary and are preserved from the original stylesheet, except for the five normalizations enumerated in Task 1. Do not invent new class names for existing visuals.

---

### Task 1: `packages/ui` scaffolding, stylesheet extraction, Vite lib build

**Files:**
- Create: `packages/ui/package.json`
- Create: `packages/ui/vite.config.js`
- Create: `packages/ui/vitest.config.js`
- Create: `packages/ui/src/styles/tokens.css`
- Create: `packages/ui/src/styles/components.css`
- Create: `packages/ui/src/styles/styles.css`
- Create: `packages/ui/src/index.js`
- Create: `vitest.workspace.js` (repo root)
- Modify: `package.json` (repo root) — add a `build` script

**Interfaces:**
- Consumes: `@gv/core` (workspace dependency; not yet imported by any component, but declared).
- Produces: `@gv/ui` package resolvable as a workspace dependency; `packages/ui/src/index.js` barrel (empty of components at this task, populated by Tasks 2-3); `packages/ui/src/styles/styles.css` as the single stylesheet entry point whose `@import` closure carries all styling.

**The five CSS normalizations.** The original stylesheet was written for one page with a fixed DOM, so several rules only apply in a specific ancestor. A component library cannot rely on that — a standalone `<Button variant="book">` in Storybook or in Claude Design would render completely unstyled. Apply exactly these five changes when copying, and no others:

| # | Original (`css/style.css`) | Becomes | Why |
|---|---|---|---|
| 1 | `#profile-badge { … }` (line 140) | `.profile-badge { … }` | ID selectors cannot be reused; a component library has no unique IDs |
| 2 | `.slot-action .btn-full { … }` (line 273) | `.btn-full { … }` | `Button variant="full"` must style itself outside a slot card |
| 3 | `.slot-action .btn-book { … }` and `.slot-action .btn-book:hover` (lines 282, 291) | `.btn-book`, `.btn-book:hover` | same |
| 4 | `.slot-guests .guest-chip { … }` (line 264) | `.guest-chip { … }` | `Chip` must style itself anywhere, including in the modal |
| 5 | `.month-nav, .day-nav` and their descendant rules (lines 176, 186) | `.pager-nav` (single selector, `.month-nav`/`.day-nav` dropped) | the two rule sets are identical; `PagerNav` unifies them (spec, "Component inventory") |

Every other selector is copied verbatim, including `.hidden`, `.muted`, the `@media (max-width: 480px)` block, and the `*, body, h1, h2, form, label, input, select` element rules.

- [ ] **Step 1: Create the package manifest**

Create `packages/ui/package.json`:

```json
{
  "name": "@gv/ui",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.js",
  "exports": {
    ".": "./src/index.js",
    "./styles.css": "./src/styles/styles.css"
  },
  "files": ["dist", "src"],
  "scripts": {
    "build": "vite build"
  },
  "dependencies": {
    "@gv/core": "*"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.0",
    "@vitejs/plugin-react": "^4.3.0",
    "jsdom": "^25.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "vite": "^6.0.0"
  }
}
```

`firebase` is absent and must stay absent — that is the structural guarantee, not a convention.

- [ ] **Step 2: Create the build and test configs**

Create `packages/ui/vite.config.js`:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: fileURLToPath(new URL("src/index.js", import.meta.url)),
      name: "GvUi",
      fileName: "gv-ui",
      formats: ["es"],
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
    },
    cssCodeSplit: false,
    emptyOutDir: true,
  },
});
```

Create `packages/ui/vitest.config.js`:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./src/test-setup.js"],
  },
});
```

Create `packages/ui/src/test-setup.js`:

```js
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: Create the root workspace test config**

`packages/core` runs in Node and `packages/ui` needs jsdom, so the root suite becomes a Vitest workspace.

Create `vitest.workspace.js` at the repo root:

```js
export default ["packages/core", "packages/ui"];
```

Modify the root `package.json` to add a `build` script. The `scripts` block becomes:

```json
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "build": "npm run build --workspace @gv/ui"
  },
```

Leave every other field in the root `package.json` unchanged.

- [ ] **Step 4: Verify core's tests still pass under the workspace config**

Run: `npm install`
Then run: `npm test`
Expected: PASS — `packages/core`'s 62 tests still pass. `packages/ui` contributes 0 tests at this point; a workspace project with no test files is not an error.

If core's 62 tests do not all pass here, STOP and report — the workspace config has broken Phase 1 and that must be fixed before continuing.

- [ ] **Step 5: Create `tokens.css`**

Create `packages/ui/src/styles/tokens.css` — the 13 custom properties, copied verbatim from `css/style.css` lines 1-13:

```css
:root {
  --bg: #FBF7F1;
  --card-bg: #FFFFFF;
  --primary: #6E9277;
  --primary-dark: #587A61;
  --accent: #E9B8B0;
  --text: #3A3733;
  --muted: #8A8478;
  --danger: #C15C5C;
  --danger-dark: #A44848;
  --border: #EBE4D8;
  --radius: 18px;
  --shadow: 0 4px 20px rgba(60, 50, 30, 0.08);
}
```

- [ ] **Step 6: Create `components.css`**

Create `packages/ui/src/styles/components.css` by copying `css/style.css` lines 15 to the end (everything after the `:root` block), applying exactly the five normalizations in the table above.

Read `css/style.css` and transcribe it. Do not retype it from memory and do not restyle anything. The result must be byte-identical to the original from line 15 onward except for these five selector changes:

- `#profile-badge {` → `.profile-badge {`
- `.slot-action .btn-full {` → `.btn-full {`
- `.slot-action .btn-book {` → `.btn-book {`
- `.slot-action .btn-book:hover {` → `.btn-book:hover {`
- `.slot-guests .guest-chip {` → `.guest-chip {`
- `.month-nav, .day-nav {` → `.pager-nav {`
- `.month-nav button, .day-nav button {` → `.pager-nav button {`
- `.month-nav h2, .day-nav h2 {` → `.pager-nav h2 {`

(The last three are normalization #5 counted as one change.)

- [ ] **Step 7: Create `styles.css` — the single entry point**

Create `packages/ui/src/styles/styles.css`:

```css
@import url("https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&family=Inter:wght@400;500;600&display=swap");
@import "./tokens.css";
@import "./components.css";
```

This file's transitive `@import` closure is the ONLY styling that design-sync delivers to rendered designs, which is why `components.css` must be reachable from here rather than linked separately. All `@import` rules must come first in the file — that is a CSS requirement, not a style preference.

Note for Phase 4: the remote Google Fonts `@import` should become self-hosted font files in a `fonts/` directory before the design-sync upload. Not this phase.

- [ ] **Step 8: Create the barrel**

Create `packages/ui/src/index.js`:

```js
// Component exports are added by Tasks 2 and 3.
export {};
```

- [ ] **Step 9: Verify the stylesheet copy is faithful**

Run this comparison, which strips the five intentional changes and diffs the rest:

```bash
sed -e 's/^\.profile-badge {/#profile-badge {/' \
    -e 's/^\.btn-full {/.slot-action .btn-full {/' \
    -e 's/^\.btn-book {/.slot-action .btn-book {/' \
    -e 's/^\.btn-book:hover {/.slot-action .btn-book:hover {/' \
    -e 's/^\.guest-chip {/.slot-guests .guest-chip {/' \
    -e 's/^\.pager-nav {/.month-nav, .day-nav {/' \
    -e 's/^\.pager-nav button {/.month-nav button, .day-nav button {/' \
    -e 's/^\.pager-nav h2 {/.month-nav h2, .day-nav h2 {/' \
    packages/ui/src/styles/components.css > /tmp/ui-normalized.css
tail -n +15 css/style.css > /tmp/orig-tail.css
diff /tmp/orig-tail.css /tmp/ui-normalized.css && echo "IDENTICAL"
```

Expected: `IDENTICAL`. Any other output means the copy drifted — fix it before committing. Report the diff output in your report either way.

- [ ] **Step 10: Verify the build produces a bundle**

Run: `npm run build`
Expected: succeeds, creating `packages/ui/dist/gv-ui.js`. The bundle will be near-empty (the barrel exports nothing yet) — that is expected. A build FAILURE is a real problem; an empty bundle is not.

- [ ] **Step 11: Verify the firebase and passcode constraints**

Run: `node -e "const p=require('./packages/ui/package.json'); const d=Object.keys(p.dependencies||{}); if(d.some(x=>x.includes('firebase'))){console.error('FAIL: ui depends on firebase');process.exit(1)} console.log('OK: ui deps =',d.join(',')||'(none)')"`
Expected: `OK: ui deps = @gv/core`

Run: `grep -rn "2707" packages/ui/ --exclude-dir=node_modules --exclude-dir=dist || echo "OK: no passcode in ui"`
Expected: `OK: no passcode in ui`

- [ ] **Step 12: Commit**

```bash
git add packages/ui/package.json packages/ui/vite.config.js packages/ui/vitest.config.js packages/ui/src/test-setup.js packages/ui/src/styles packages/ui/src/index.js vitest.workspace.js package.json package-lock.json
git commit -m "Add @gv/ui package with normalized stylesheet and Vite lib build"
```

---

### Task 2: Storybook + the `Button` primitive

Button goes first and alone because it proves the whole harness end to end — JSX compiles, the stylesheet loads, Storybook renders, and tests run against a real DOM. Everything in Task 3 depends on that being true.

**Files:**
- Create: `packages/ui/.storybook/main.js`
- Create: `packages/ui/.storybook/preview.js`
- Create: `packages/ui/src/primitives/Button.jsx`
- Create: `packages/ui/src/primitives/Button.stories.jsx`
- Create: `packages/ui/src/primitives/Button.test.jsx`
- Modify: `packages/ui/src/index.js`
- Modify: `packages/ui/package.json` (Storybook devDependencies + scripts)

**Interfaces:**
- Consumes: the stylesheet and package scaffolding from Task 1.
- Produces: `Button({ variant, type, disabled, onClick, children, ...rest })` where `variant` is one of `"primary" | "link" | "danger" | "book" | "full"`, defaulting to `"primary"`. Exported from the `@gv/ui` barrel. Tasks 3 and Phase 2B import it.

- [ ] **Step 1: Add Storybook to the package manifest**

In `packages/ui/package.json`, add to `devDependencies`:

```json
    "@storybook/addon-essentials": "^8.4.0",
    "@storybook/react": "^8.4.0",
    "@storybook/react-vite": "^8.4.0",
    "storybook": "^8.4.0",
```

and add to `scripts`:

```json
    "storybook": "storybook dev -p 6006 --no-open",
    "build-storybook": "storybook build"
```

Then run `npm install`.

- [ ] **Step 2: Create the Storybook config**

Create `packages/ui/.storybook/main.js`:

```js
export default {
  stories: ["../src/**/*.stories.jsx"],
  addons: ["@storybook/addon-essentials"],
  framework: { name: "@storybook/react-vite", options: {} },
};
```

Create `packages/ui/.storybook/preview.js`:

```js
import "../src/styles/styles.css";

export default {
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "app",
      values: [{ name: "app", value: "#FBF7F1" }],
    },
  },
};
```

The stylesheet import is what makes every story render with the real design system. The background matches `--bg` so stories look like the app, not like a white void.

- [ ] **Step 3: Write the failing test**

Create `packages/ui/src/primitives/Button.test.jsx`:

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button.jsx";

describe("Button", () => {
  it("renders its children", () => {
    render(<Button>Continue</Button>);
    expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument();
  });

  it("defaults to the primary variant", () => {
    render(<Button>Continue</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-primary");
  });

  it.each([
    ["primary", "btn-primary"],
    ["link", "btn-link"],
    ["danger", "btn-danger"],
    ["book", "btn-book"],
    ["full", "btn-full"],
  ])("maps variant %s to class %s", (variant, className) => {
    render(<Button variant={variant}>Label</Button>);
    expect(screen.getByRole("button")).toHaveClass(className);
  });

  it("defaults to type=button so it never submits a form by accident", () => {
    render(<Button>Label</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("accepts type=submit", () => {
    render(<Button type="submit">Confirm</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Label</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not call onClick when disabled", async () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Label</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("forwards arbitrary attributes such as aria-label", () => {
    render(<Button aria-label="Close">×</Button>);
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm test -- packages/ui/src/primitives/Button.test.jsx`
Expected: FAIL — cannot resolve `./Button.jsx`.

- [ ] **Step 5: Write the implementation**

Create `packages/ui/src/primitives/Button.jsx`:

```jsx
const VARIANT_CLASS = {
  primary: "btn-primary",
  link: "btn-link",
  danger: "btn-danger",
  book: "btn-book",
  full: "btn-full",
};

export function Button({
  variant = "primary",
  type = "button",
  disabled = false,
  onClick,
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      className={VARIANT_CLASS[variant]}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}
```

`type` defaults to `"button"` deliberately: React renders `<button>` as `type="submit"` by default, and several of these buttons sit inside forms where an accidental submit would be a real bug.

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- packages/ui/src/primitives/Button.test.jsx`
Expected: PASS, 12 tests.

- [ ] **Step 7: Write the stories**

Create `packages/ui/src/primitives/Button.stories.jsx`:

```jsx
import { Button } from "./Button.jsx";

export default {
  title: "Primitives/Button",
  component: Button,
};

export const Primary = { args: { variant: "primary", children: "Continue" } };
export const PrimaryDisabled = { args: { variant: "primary", children: "Continue", disabled: true } };
export const Link = { args: { variant: "link", children: "Edit" } };
export const Danger = { args: { variant: "danger", children: "Cancel booking" } };
export const Book = { args: { variant: "book", children: "Book" } };
export const Full = { args: { variant: "full", children: "Full" } };
```

- [ ] **Step 8: Export from the barrel**

Replace the contents of `packages/ui/src/index.js` with:

```js
export { Button } from "./primitives/Button.jsx";
```

- [ ] **Step 9: Verify Storybook builds**

Run: `npm run build-storybook --workspace @gv/ui`
Expected: succeeds, producing `packages/ui/storybook-static/`. This is the harness proof — if it fails here, Task 3 cannot proceed.

Confirm `storybook-static/` is gitignored (the root `.gitignore` from Phase 1 already lists it). Do not commit it.

- [ ] **Step 10: Verify the build still works**

Run: `npm run build`
Expected: succeeds; `packages/ui/dist/gv-ui.js` now contains the Button component.

- [ ] **Step 11: Commit**

```bash
git add packages/ui/.storybook packages/ui/src/primitives packages/ui/src/index.js packages/ui/package.json package-lock.json
git commit -m "Add Storybook harness and Button primitive to @gv/ui"
```

---

### Task 3: The remaining 10 primitives

Same-shape work: each component is a pure function returning JSX with the class names the stylesheet already defines. Build all ten in this one task, with tests and stories for each.

**Files:**
- Create: `packages/ui/src/primitives/Card.jsx`, `TextField.jsx`, `SelectField.jsx`, `Modal.jsx`, `Toast.jsx`, `Chip.jsx`, `Tabs.jsx`, `EmptyState.jsx`, `EmojiHero.jsx`, `FormError.jsx`
- Create: a `.stories.jsx` and a `.test.jsx` beside each
- Modify: `packages/ui/src/index.js`

**Interfaces:**
- Consumes: `Button` from Task 2 (used inside no primitive here, but the barrel pattern is established).
- Produces, all exported from the `@gv/ui` barrel:
  - `Card({ centered, children, className })`
  - `TextField({ id, label, type, value, onChange, placeholder, maxLength, required, inputMode, autoComplete })`
  - `SelectField({ id, label, options, value, onChange })` where `options` is `Array<{ value: string, label: string }>`
  - `Modal({ title, subtitle, onClose, children })`
  - `Toast({ message, tone })` where `tone` is `"default" | "error"`
  - `Chip({ children })`
  - `Tabs({ tabs, activeId, onChange })` where `tabs` is `Array<{ id: string, label: string }>`
  - `EmptyState({ children })`
  - `EmojiHero({ emoji })`
  - `FormError({ children })`

- [ ] **Step 1: Write the failing tests**

Create `packages/ui/src/primitives/Card.test.jsx`:

```jsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "./Card.jsx";

describe("Card", () => {
  it("renders children inside a card", () => {
    render(<Card>Hello</Card>);
    expect(screen.getByText("Hello")).toHaveClass("card");
  });
  it("adds the centered class when centered", () => {
    render(<Card centered>Hello</Card>);
    expect(screen.getByText("Hello")).toHaveClass("card", "centered");
  });
  it("is not centered by default", () => {
    render(<Card>Hello</Card>);
    expect(screen.getByText("Hello")).not.toHaveClass("centered");
  });
  it("appends an extra className", () => {
    render(<Card className="extra">Hello</Card>);
    expect(screen.getByText("Hello")).toHaveClass("card", "extra");
  });
});
```

Create `packages/ui/src/primitives/TextField.test.jsx`:

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TextField } from "./TextField.jsx";

describe("TextField", () => {
  it("associates its label with its input", () => {
    render(<TextField id="name" label="Your name" value="" onChange={() => {}} />);
    expect(screen.getByLabelText("Your name")).toBeInTheDocument();
  });
  it("renders no label element when no label is given", () => {
    const { container } = render(<TextField id="pin" value="" onChange={() => {}} />);
    expect(container.querySelector("label")).toBeNull();
  });
  it("shows the current value", () => {
    render(<TextField id="name" label="Your name" value="Maria" onChange={() => {}} />);
    expect(screen.getByLabelText("Your name")).toHaveValue("Maria");
  });
  it("calls onChange as the user types", async () => {
    const onChange = vi.fn();
    render(<TextField id="name" label="Your name" value="" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Your name"), "A");
    expect(onChange).toHaveBeenCalled();
  });
  it("passes through type, placeholder and maxLength", () => {
    render(
      <TextField id="pin" label="Passcode" type="password" placeholder="Passcode" maxLength={40} value="" onChange={() => {}} />
    );
    const input = screen.getByLabelText("Passcode");
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveAttribute("placeholder", "Passcode");
    expect(input).toHaveAttribute("maxLength", "40");
  });
});
```

Create `packages/ui/src/primitives/SelectField.test.jsx`:

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SelectField } from "./SelectField.jsx";

const OPTIONS = [
  { value: "", label: "Prefer not to say" },
  { value: "Auntie", label: "Auntie" },
  { value: "Uncle", label: "Uncle" },
];

describe("SelectField", () => {
  it("associates its label with its select", () => {
    render(<SelectField id="rel" label="Relationship" options={OPTIONS} value="" onChange={() => {}} />);
    expect(screen.getByLabelText("Relationship")).toBeInTheDocument();
  });
  it("renders one option per entry", () => {
    render(<SelectField id="rel" label="Relationship" options={OPTIONS} value="" onChange={() => {}} />);
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });
  it("reflects the selected value", () => {
    render(<SelectField id="rel" label="Relationship" options={OPTIONS} value="Uncle" onChange={() => {}} />);
    expect(screen.getByLabelText("Relationship")).toHaveValue("Uncle");
  });
  it("calls onChange when a different option is picked", async () => {
    const onChange = vi.fn();
    render(<SelectField id="rel" label="Relationship" options={OPTIONS} value="" onChange={onChange} />);
    await userEvent.selectOptions(screen.getByLabelText("Relationship"), "Auntie");
    expect(onChange).toHaveBeenCalled();
  });
});
```

Create `packages/ui/src/primitives/Modal.test.jsx`:

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "./Modal.jsx";

describe("Modal", () => {
  it("renders its title, subtitle and children", () => {
    render(<Modal title="Book this slot" subtitle="Saturday at 9:00 AM">Body</Modal>);
    expect(screen.getByRole("heading", { name: "Book this slot" })).toBeInTheDocument();
    expect(screen.getByText("Saturday at 9:00 AM")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", async () => {
    const onClose = vi.fn();
    render(<Modal title="T" onClose={onClose}>Body</Modal>);
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when the overlay itself is clicked", async () => {
    const onClose = vi.fn();
    const { container } = render(<Modal title="T" onClose={onClose}>Body</Modal>);
    await userEvent.click(container.querySelector(".modal-overlay"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does NOT close when the dialog body is clicked", async () => {
    const onClose = vi.fn();
    render(<Modal title="T" onClose={onClose}>Body</Modal>);
    await userEvent.click(screen.getByText("Body"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("omits the subtitle element when no subtitle is given", () => {
    const { container } = render(<Modal title="T">Body</Modal>);
    expect(container.querySelector(".muted")).toBeNull();
  });
});
```

Create `packages/ui/src/primitives/Toast.test.jsx`:

```jsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Toast } from "./Toast.jsx";

describe("Toast", () => {
  it("renders its message", () => {
    render(<Toast message="Visit booked!" />);
    expect(screen.getByText("Visit booked!")).toHaveClass("toast");
  });
  it("adds the error class for the error tone", () => {
    render(<Toast message="Something went wrong." tone="error" />);
    expect(screen.getByText("Something went wrong.")).toHaveClass("toast", "error");
  });
  it("has no error class by default", () => {
    render(<Toast message="Visit booked!" />);
    expect(screen.getByText("Visit booked!")).not.toHaveClass("error");
  });
  it("renders nothing when there is no message", () => {
    const { container } = render(<Toast message="" />);
    expect(container).toBeEmptyDOMElement();
  });
});
```

Create `packages/ui/src/primitives/Chip.test.jsx`:

```jsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Chip } from "./Chip.jsx";

describe("Chip", () => {
  it("renders its children with the guest-chip class", () => {
    render(<Chip>Aunt Maria</Chip>);
    expect(screen.getByText("Aunt Maria")).toHaveClass("guest-chip");
  });
});
```

Create `packages/ui/src/primitives/Tabs.test.jsx`:

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs } from "./Tabs.jsx";

const TABS = [
  { id: "calendar", label: "Calendar" },
  { id: "day", label: "Day view" },
  { id: "mine", label: "My bookings" },
];

describe("Tabs", () => {
  it("renders one button per tab", () => {
    render(<Tabs tabs={TABS} activeId="calendar" onChange={() => {}} />);
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });
  it("marks only the active tab active", () => {
    render(<Tabs tabs={TABS} activeId="day" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Day view" })).toHaveClass("tab-btn", "active");
    expect(screen.getByRole("button", { name: "Calendar" })).not.toHaveClass("active");
  });
  it("calls onChange with the tab id", async () => {
    const onChange = vi.fn();
    render(<Tabs tabs={TABS} activeId="calendar" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "My bookings" }));
    expect(onChange).toHaveBeenCalledWith("mine");
  });
});
```

Create `packages/ui/src/primitives/EmptyState.test.jsx`:

```jsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "./EmptyState.jsx";

describe("EmptyState", () => {
  it("renders its children with the empty-state class", () => {
    render(<EmptyState>You haven’t booked a visit yet.</EmptyState>);
    expect(screen.getByText("You haven’t booked a visit yet.")).toHaveClass("empty-state");
  });
});
```

Create `packages/ui/src/primitives/EmojiHero.test.jsx`:

```jsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmojiHero } from "./EmojiHero.jsx";

describe("EmojiHero", () => {
  it("renders the emoji with the emoji-hero class", () => {
    render(<EmojiHero emoji="👶" />);
    expect(screen.getByText("👶")).toHaveClass("emoji-hero");
  });
});
```

Create `packages/ui/src/primitives/FormError.test.jsx`:

```jsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormError } from "./FormError.jsx";

describe("FormError", () => {
  it("renders its children with the error class", () => {
    render(<FormError>That’s not quite right — try again.</FormError>);
    expect(screen.getByText("That’s not quite right — try again.")).toHaveClass("error");
  });
  it("renders nothing when it has no children", () => {
    const { container } = render(<FormError />);
    expect(container).toBeEmptyDOMElement();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- packages/ui/src/primitives`
Expected: FAIL — the ten component modules cannot be resolved. `Button.test.jsx` still passes.

- [ ] **Step 3: Write the implementations**

Create `packages/ui/src/primitives/Card.jsx`:

```jsx
export function Card({ centered = false, children, className = "" }) {
  const classes = ["card", centered && "centered", className].filter(Boolean).join(" ");
  return <div className={classes}>{children}</div>;
}
```

Create `packages/ui/src/primitives/TextField.jsx`:

```jsx
export function TextField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  maxLength,
  required = false,
  inputMode,
  autoComplete,
}) {
  return (
    <>
      {label && <label htmlFor={id}>{label}</label>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        inputMode={inputMode}
        autoComplete={autoComplete}
      />
    </>
  );
}
```

The fragment is deliberate: in the original markup the `<label>` and `<input>` are siblings inside the `<form>`, which is the flex container that spaces them. Wrapping them in a `<div>` would break that layout.

Create `packages/ui/src/primitives/SelectField.jsx`:

```jsx
export function SelectField({ id, label, options = [], value, onChange }) {
  return (
    <>
      {label && <label htmlFor={id}>{label}</label>}
      <select id={id} value={value} onChange={onChange}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </>
  );
}
```

Create `packages/ui/src/primitives/Modal.jsx`:

```jsx
export function Modal({ title, subtitle, onClose, children }) {
  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="modal">
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        {title && <h2>{title}</h2>}
        {subtitle && <p className="muted">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}
```

The `e.target === e.currentTarget` check preserves the original behavior at `js/app.js:514`: clicking the backdrop closes the modal, clicking inside it does not.

Create `packages/ui/src/primitives/Toast.jsx`:

```jsx
export function Toast({ message, tone = "default" }) {
  if (!message) return null;
  return <div className={tone === "error" ? "toast error" : "toast"}>{message}</div>;
}
```

Create `packages/ui/src/primitives/Chip.jsx`:

```jsx
export function Chip({ children }) {
  return <span className="guest-chip">{children}</span>;
}
```

Create `packages/ui/src/primitives/Tabs.jsx`:

```jsx
export function Tabs({ tabs = [], activeId, onChange }) {
  return (
    <nav className="tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={tab.id === activeId ? "tab-btn active" : "tab-btn"}
          onClick={() => onChange?.(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
```

Create `packages/ui/src/primitives/EmptyState.jsx`:

```jsx
export function EmptyState({ children }) {
  return <div className="empty-state">{children}</div>;
}
```

Create `packages/ui/src/primitives/EmojiHero.jsx`:

```jsx
export function EmojiHero({ emoji }) {
  return <div className="emoji-hero">{emoji}</div>;
}
```

Create `packages/ui/src/primitives/FormError.jsx`:

```jsx
export function FormError({ children }) {
  if (!children) return null;
  return <p className="error">{children}</p>;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- packages/ui/src/primitives`
Expected: PASS, 42 tests (12 Button + 30 across the ten new components).

- [ ] **Step 5: Write the stories**

Create `packages/ui/src/primitives/Card.stories.jsx`:

```jsx
import { Card } from "./Card.jsx";

export default { title: "Primitives/Card", component: Card };

export const Default = { args: { children: "Card content" } };
export const Centered = { args: { centered: true, children: "Centered card content" } };
```

Create `packages/ui/src/primitives/TextField.stories.jsx`:

```jsx
import { TextField } from "./TextField.jsx";

export default { title: "Primitives/TextField", component: TextField };

export const WithLabel = {
  args: { id: "name", label: "Your name", placeholder: "e.g. Aunt Maria", value: "", onChange: () => {} },
};
export const Filled = {
  args: { id: "name", label: "Your name", value: "Aunt Maria", onChange: () => {} },
};
export const Passcode = {
  args: { id: "pin", type: "password", placeholder: "Passcode", value: "", onChange: () => {} },
};
```

Create `packages/ui/src/primitives/SelectField.stories.jsx`:

```jsx
import { SelectField } from "./SelectField.jsx";

const OPTIONS = [
  { value: "", label: "Prefer not to say" },
  { value: "Grandmother", label: "Grandmother" },
  { value: "Auntie", label: "Auntie" },
  { value: "Friend of the family", label: "Friend of the family" },
];

export default { title: "Primitives/SelectField", component: SelectField };

export const Default = {
  args: { id: "rel", label: "Relationship to baby (optional)", options: OPTIONS, value: "", onChange: () => {} },
};
export const Selected = {
  args: { id: "rel", label: "Relationship to baby (optional)", options: OPTIONS, value: "Auntie", onChange: () => {} },
};
```

Create `packages/ui/src/primitives/Modal.stories.jsx`:

```jsx
import { Modal } from "./Modal.jsx";

export default {
  title: "Primitives/Modal",
  component: Modal,
  parameters: { layout: "fullscreen" },
};

export const Default = {
  args: {
    title: "Book this slot",
    subtitle: "Saturday, August 29 at 9:00 AM",
    onClose: () => {},
    children: "Modal body content goes here.",
  },
};
export const TitleOnly = {
  args: { title: "Book this slot", onClose: () => {}, children: "Modal body content goes here." },
};
```

Create `packages/ui/src/primitives/Toast.stories.jsx`:

```jsx
import { Toast } from "./Toast.jsx";

export default {
  title: "Primitives/Toast",
  component: Toast,
  parameters: { layout: "fullscreen" },
};

export const Success = { args: { message: "Visit booked!" } };
export const Error = { args: { message: "Sorry, that slot just filled up.", tone: "error" } };
```

Create `packages/ui/src/primitives/Chip.stories.jsx`:

```jsx
import { Chip } from "./Chip.jsx";

export default { title: "Primitives/Chip", component: Chip };

export const Default = { args: { children: "Aunt Maria" } };
export const WithRelationship = { args: { children: "Aunt Maria (Auntie)" } };
```

Create `packages/ui/src/primitives/Tabs.stories.jsx`:

```jsx
import { Tabs } from "./Tabs.jsx";

const TABS = [
  { id: "calendar", label: "Calendar" },
  { id: "day", label: "Day view" },
  { id: "mine", label: "My bookings" },
];

export default { title: "Primitives/Tabs", component: Tabs };

export const CalendarActive = { args: { tabs: TABS, activeId: "calendar", onChange: () => {} } };
export const MyBookingsActive = { args: { tabs: TABS, activeId: "mine", onChange: () => {} } };
```

Create `packages/ui/src/primitives/EmptyState.stories.jsx`:

```jsx
import { EmptyState } from "./EmptyState.jsx";

export default { title: "Primitives/EmptyState", component: EmptyState };

export const Default = { args: { children: "You haven’t booked a visit yet." } };
```

Create `packages/ui/src/primitives/EmojiHero.stories.jsx`:

```jsx
import { EmojiHero } from "./EmojiHero.jsx";

export default { title: "Primitives/EmojiHero", component: EmojiHero };

export const Baby = { args: { emoji: "👶" } };
export const Flowers = { args: { emoji: "💐" } };
```

Create `packages/ui/src/primitives/FormError.stories.jsx`:

```jsx
import { FormError } from "./FormError.jsx";

export default { title: "Primitives/FormError", component: FormError };

export const Default = { args: { children: "That’s not quite right — try again." } };
```

- [ ] **Step 6: Update the barrel**

Replace the contents of `packages/ui/src/index.js` with:

```js
export { Button } from "./primitives/Button.jsx";
export { Card } from "./primitives/Card.jsx";
export { Chip } from "./primitives/Chip.jsx";
export { EmojiHero } from "./primitives/EmojiHero.jsx";
export { EmptyState } from "./primitives/EmptyState.jsx";
export { FormError } from "./primitives/FormError.jsx";
export { Modal } from "./primitives/Modal.jsx";
export { SelectField } from "./primitives/SelectField.jsx";
export { Tabs } from "./primitives/Tabs.jsx";
export { TextField } from "./primitives/TextField.jsx";
export { Toast } from "./primitives/Toast.jsx";
```

- [ ] **Step 7: Add a barrel completeness test**

Create `packages/ui/src/index.test.js`:

```js
import { describe, it, expect } from "vitest";
import * as ui from "./index.js";

describe("@gv/ui barrel", () => {
  it("exports all 11 primitives", () => {
    for (const name of [
      "Button",
      "Card",
      "Chip",
      "EmojiHero",
      "EmptyState",
      "FormError",
      "Modal",
      "SelectField",
      "Tabs",
      "TextField",
      "Toast",
    ]) {
      expect(ui[name], `missing export: ${name}`).toBeDefined();
    }
  });
});
```

- [ ] **Step 8: Run the whole suite**

Run: `npm test`
Expected: PASS — 105 tests total: `packages/core`'s 62 plus `packages/ui`'s 43 (42 component + 1 barrel).

- [ ] **Step 9: Verify Storybook builds with all stories**

Run: `npm run build-storybook --workspace @gv/ui`
Expected: succeeds. Report how many stories were built.

- [ ] **Step 10: Verify the constraints still hold**

Run: `grep -rn "firebase\|localStorage\|CONFIG\|2707" packages/ui/src/ || echo "OK: ui is clean"`
Expected: `OK: ui is clean`

Run: `npm run build`
Expected: succeeds; `packages/ui/dist/gv-ui.js` contains all 11 components.

- [ ] **Step 11: Commit**

```bash
git add packages/ui/src/primitives packages/ui/src/index.js packages/ui/src/index.test.js
git commit -m "Add remaining 10 primitives to @gv/ui with tests and stories"
```

---

## Phase 2A done-bar

- `npm install` succeeds from a clean checkout.
- `npm test` passes: 105 tests total — 62 core + 43 ui.
- `npm run build` produces `packages/ui/dist/gv-ui.js` containing all 11 primitives.
- `npm run build-storybook --workspace @gv/ui` succeeds with stories for all 11 primitives.
- `packages/ui/package.json` `dependencies` contains only `@gv/core` — no `firebase`.
- No `firebase`, `localStorage`, `CONFIG`, or the passcode string anywhere under `packages/ui/src/`.
- `packages/ui/src/styles/components.css` is byte-identical to `css/style.css` from line 15 onward, except for the five documented normalizations.
- The root `js/`, `css/`, and `index.html` are unchanged and the existing app still works.

## What Phase 2A deliberately does not do

- No domain components (`SlotCard`, `CalendarGrid`, `DayCell`, …) and no screens — those are Phase 2B.
- Does not touch `js/app.js` or the live app in any way.
- Does not self-host fonts. `styles.css` still pulls Quicksand and Inter from Google Fonts over the network. Phase 4 replaces that with a local `fonts/` directory before the design-sync upload.
- Does not run `/design-sync`. Nothing is uploaded anywhere in this phase.

## Correction to the spec, carried into Phase 2B

The spec's component inventory lists `GuestList` as one component derived from both `.slot-guests` and `.modal-guests`. That is wrong: `js/app.js:379-421` renders slot-card guests as `Chip` elements, while `js/app.js:490` renders modal guests as a plain comma-joined string prefixed with "Already booked: ". They are two presentations, not one. `GuestList` in Phase 2B takes a `variant: "chips" | "inline"` prop. Recorded here so Phase 2B's plan inherits it.
