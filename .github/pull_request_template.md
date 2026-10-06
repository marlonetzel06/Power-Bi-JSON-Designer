## What does this PR do?

<!-- Short description of the change -->

## Type of change

- [ ] Bug fix
- [ ] New feature / improvement
- [ ] Refactoring (no functional change)
- [ ] Documentation

## How to test

1. `cd react-app && npm ci && npm run dev`
2. Open `http://localhost:5173`
3. 

## Checklist

- [ ] `npm run check` passes (lint, typecheck, unit tests, build)
- [ ] `npm run test:e2e` passes (Playwright smoke + axe)
- [ ] Mock preview reflects the change (and live preview, if the change touches the embed)
- [ ] Exported theme validates against the official schema (JSON pane shows "Schema valid")
- [ ] New UI strings exist in `src/i18n/de.ts` and `src/i18n/en.ts`
- [ ] No secrets or credentials committed
