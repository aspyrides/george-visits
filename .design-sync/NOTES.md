# design-sync notes — Cradle

Project: **Cradle** — https://claude.ai/design/p/8f75d3e2-918a-4818-b366-2246b10043eb
First sync: 2026-09-03. Shape: storybook. 27 components.

## Things that were non-obvious, and would bite again

- **The converter reads the component roster from `.d.ts`, not from the JS
  bundle.** With no declarations it found 0 components and everything
  downstream silently produced an empty bundle. `packages/ui/src/index.d.ts`
  is hand-written and is the API contract the design agent codes against —
  keep it in step with the components or the agent will misuse props.
- **`cfg.cssEntry` is package-relative and its content is appended
  literally.** An `@import`-only stylesheet contributes nothing. Hence
  `packages/ui/scripts/build-css.mjs`, which flattens tokens + components
  into `dist/ds-styles.css`. It runs as part of `npm run build`.
- **`cfg.extraFonts` is package-relative too** (`src/styles/fonts.css`),
  even though the containment bound is the workspace root. A workspace-root
  path is silently "not found".
- **Fonts are self-hosted on purpose.** Designs receive only the transitive
  `@import` closure of `styles.css`, so a remote Google Fonts import would
  leave rendered designs on fallback system fonts.
- **Three overlay components need `cardMode: "single"`** (Modal, Toast,
  BookingModal) — they are `position: fixed` and otherwise escape their
  grid cell.
- **`.design-sync/previews/Toast.tsx` is hand-authored and owned.** Toast is
  fixed to the viewport bottom, so the generated preview screenshotted
  completely blank. The authored one gives it a transformed containing block
  so `fixed` resolves inside the card. Do not delete it.

## Re-sync risks — re-verify these rather than assuming carry-forward

1. Adding a component without adding it to `src/index.d.ts` makes it
   invisible to the sync. The barrel test won't catch that.
2. `.tab-panel` carries the layout that the old app's `<main>` used to
   provide. If the app is ever ported to React (Phase 3), it must NOT
   re-wrap panels in a styled `<main>` or padding applies twice.
3. The passcode gate: `grep -rn "2707" ds-bundle/ --exclude-dir=.sb-static`
   must stay empty. `.sb-static` produces a false positive from Storybook's
   own SVG path data.

## Not done

- The storybook shape's **compare loop** (screenshot diff of each story
  against the reference storybook) was skipped at the user's request to
  reduce run time. Previews were verified by the render check plus manual
  inspection of both contact sheets. Run `.ds-sync/storybook/compare.mjs`
  if mechanical pixel verification is wanted.
- Phase 3 (React port of the app) was skipped; `js/app.js` still runs the
  live site and holds its own copy of the date/booking logic.
