---
applyTo: '**'
---

# General instructions

Full architecture, conventions, commands, and gotchas: see [`AGENTS.md`](../../AGENTS.md) at the repo root.

## Documentation

- Do not add README.md files for the changes you make
- Do not create `.env` files
- Avoid describing simple functions or methods in the code comments

## Naming Conventions

- Use PascalCase for component names, interfaces, and type aliases
- Use camelCase for variables, functions, and methods
- Use ALL_CAPS for constants

## Tools

- Use Prettier for code formatting
- Use ESLint for linting
- Use TypeScript for type checking
- Use Vitest for unit testing
- No E2E framework is set up (no Playwright/Cypress) — Vitest covers unit tests only
- Use PNPM for package management
- Use TanStack Start (file-based routing via TanStack Router conventions)
- Use Tanstack Query for data fetching
- Use Tailwind for styling, but use SCSS if the stylnig is very complex
- Use Jøkul design system for UI components (https://jokul.fremtind.no/)
