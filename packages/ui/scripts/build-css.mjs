// Emits a flattened stylesheet for consumers that cannot follow @import —
// notably the design-sync converter, which appends cfg.cssEntry's literal
// content into _ds_bundle.css. fonts.css is deliberately excluded: font
// faces reach the bundle through cfg.extraFonts, which also copies the
// woff2 files themselves.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const dir = (p) => fileURLToPath(new URL(p, import.meta.url));
const parts = ["../src/styles/tokens.css", "../src/styles/components.css"];

mkdirSync(dir("../dist"), { recursive: true });
const out = parts.map((p) => `/* --- ${p.split("/").pop()} --- */\n${readFileSync(dir(p), "utf8")}`).join("\n");
writeFileSync(dir("../dist/ds-styles.css"), out);
console.log(`ds-styles.css: ${out.length} bytes from ${parts.length} files`);
