// Authored preview (owned — the converter never overwrites this file).
//
// Toast is `position: fixed; bottom: 24px; left: 50%`, anchored to the
// viewport. A generated story render therefore lands outside the captured
// card and screenshots completely blank, which is what [RENDER_BLANK]
// caught. A `transform` on an ancestor makes `position: fixed` resolve
// against that ancestor instead of the viewport, so the real component —
// real classes, real stylesheet, no restyling — renders inside the card.
import * as React from "react";
import { Toast } from "@gv/ui";

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        transform: "translateZ(0)",
        width: 420,
        height: 120,
        background: "var(--bg)",
      }}
    >
      {children}
    </div>
  );
}

export const Success = () => (
  <Stage>
    <Toast message="Visit booked!" />
  </Stage>
);

export const Error = () => (
  <Stage>
    <Toast message="Sorry, that slot just filled up." tone="error" />
  </Stage>
);
