# AGENTS.md — Office Pong Leaderboard

## Purpose
This document provides essential context and conventions for AI coding agents working in this codebase. It enables agents to be productive and consistent with project standards from the start.

## Architecture Overview
- **React 18 + TypeScript**: Mobile-first SPA for tracking office ping pong matches and ELO-based rankings.
- **Supabase**: Backend for data storage and authentication. See `src/lib/supabase.ts` and `src/utils/env.ts`.
- **TanStack Router**: File-based routing in `src/routes/`, with auto-generated route tree in `src/routeTree.gen.ts`.
- **TanStack Query**: State management and data fetching, provided at root in `src/main.tsx`.
- **Jøkul Design System**: UI components, styled with Tailwind (Jøkul preset) and SCSS for complex cases.

## Key Patterns & Structure
- **Pages**: `src/pages/` (e.g., `Leaderboard.tsx`, `Profile.tsx`).
- **Routes**: `src/routes/` (file-based, params use `$`).
- **Components**: `src/components/` (domain-based folders, e.g., `player-metrics/`).
- **Business Logic**: `src/lib/` (e.g., `dataService.ts`, `eloService.ts`).
- **Types**: Centralized in `src/types/`.
- **Tests**: Unit tests in `src/lib/__tests__/` (Vitest + Testing Library).

## Developer Workflows
- Install: `pnpm install`
- Dev server: `pnpm dev`
- Build: `pnpm build`
- Test: `pnpm test`
- Type check: `pnpm types:check`
- Lint: `pnpm lint`
- Format: `pnpm prettier`

## Project Conventions
- **Naming**: PascalCase (components/types), camelCase (vars/functions), ALL_CAPS (constants).
- **Routing**: File-based, params as `$` (e.g., `profil.$id.tsx`).
- **Data**: Use TanStack Query hooks, never fetch directly in components.
- **Environment**: Use `env.ts` and Vite env vars; never hardcode secrets.
- **UI**: Prefer Jøkul components, Tailwind for layout, SCSS for complex styles.
- **Language**: Norwegian text throughout UI.

## Integration Points
- **Supabase**: All DB access via `src/lib/supabase.ts` and `dataService.ts`.
- **ELO**: Calculations in `eloService.ts`.
- **Confetti/Effects**: See `src/utils/confetti.ts`.

## Examples
- Add a page: create in `src/pages/`, add route in `src/routes/`.
- Fetch data: use hooks from `src/hooks/` or TanStack Query.
- Add a type: extend `src/types/pong.ts`, re-export in `src/types/index.ts`.

## References
- See `README.md` and `.github/instructions/general.instructions.md` for more details and enforced conventions.
