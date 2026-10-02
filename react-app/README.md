# Power BI Theme Designer – app

Setup and usage: see the [root README](../README.md).

```bash
npm ci
npm run dev            # dev server, http://localhost:5173
npm run check          # lint + typecheck + unit tests + build
npm run test:e2e       # Playwright smoke tests (starts the dev server itself)
npm run generate:catalog   # regenerate src/pbi/generated from schema/
```

Dev helpers: `?dev=gallery` shows every mock visual at natural size; `CHROMIUM_PATH=… node scripts/screenshot.mjs <outDir> [baseUrl]` walks the main flows and writes screenshots.

## Stack

React 19 · Vite 8 · TypeScript (strict) · Tailwind 4 bound to the M&M design tokens (`src/styles/tokens.css`) · Radix UI primitives · framer-motion · Zustand (immer, zundo, persist) · ajv against the official Power BI theme schema · Vitest + Testing Library · Playwright + axe · MSAL + powerbi-client for the optional live embed.

## Rules

- The in-memory theme **is** Power BI theme JSON. No internal aliases; every card/property key must exist in `src/pbi/generated/schemaKeys.json` (the validator flags anything else).
- No raw colours or Tailwind palette classes in components; use the token-bound classes (`bg-surface-card`, `text-text-muted`, …). ESLint enforces this.
- Every user-facing string goes through `t()` with entries in `src/i18n/de.ts` (Sie-Form) **and** `src/i18n/en.ts`; the type system fails on missing keys.
- Mock renderers read only the theme, never the app's colour mode.
