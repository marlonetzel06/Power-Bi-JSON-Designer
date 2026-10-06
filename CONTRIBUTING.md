# Contributing to Power BI JSON Theme Designer

Thank you for considering a contribution! This guide explains how to get started.

## Getting Started

1. Fork the repository
2. Clone your fork and create a feature branch:
   ```bash
   git checkout -b feature/my-change
   ```
3. Install dependencies:
   ```bash
   cd react-app
   npm ci
   ```
4. Optional (live preview only): copy the environment template and fill in your values:
   ```bash
   cp .env.example .env.local
   ```
5. Start the dev server:
   ```bash
   npm run dev
   ```

## Development Guidelines

- **Keep PRs focused** — one feature or fix per pull request.
- **Run the checks** — `npm run check` (lint, typecheck, unit tests, build) and `npm run test:e2e` (Playwright smoke tests with axe) must pass; CI runs the same.
- **TypeScript only** — strict mode, no `any` without a comment explaining why.
- **Power BI keys are the source of truth** — only card/property names that exist in the official schema (`react-app/schema/`). After a schema update run `npm run generate:catalog` and commit the generated files.
- **Design tokens only** — no raw hex or Tailwind palette classes in components (ESLint enforces it); tokens live in `src/styles/tokens.css`.
- **Two languages** — every UI string has a key in `src/i18n/de.ts` and `src/i18n/en.ts`.
- **No credentials in code** — never commit `.env.local` or any secrets. `VITE_*` values are public client configuration, but keep tenant-specific IDs out of the repository where possible.

## Pull Request Process

1. Push your branch to your fork.
2. Open a PR against `main`.
3. Fill in the PR template — describe what changed and how to test it.
4. A maintainer will review your PR. Please be patient.

## Reporting Bugs

Use the [Bug Report](https://github.com/marlonetzel06/Power-Bi-JSON-Designer/issues/new?template=bug_report.md) issue template.

## Suggesting Features

Use the [Feature Request](https://github.com/marlonetzel06/Power-Bi-JSON-Designer/issues/new?template=feature_request.md) issue template.

## Security Vulnerabilities

Please do **not** open a public issue. See [SECURITY.md](SECURITY.md) for responsible disclosure instructions.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
