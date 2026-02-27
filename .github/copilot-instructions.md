# Copilot Instructions for Office Pong Leaderboard

## Project Overview
- **Mobile-first React app** for tracking office ping pong matches and ELO-based rankings.
- **TypeScript** throughout for type safety.
- **Supabase** is used as the backend (see `src/lib/supabase.ts` and `src/utils/env.ts`).
- **TanStack Router** provides file-based routing (see `src/routes/` and `src/routeTree.gen.ts`).
- **Jøkul Design System** and **Tailwind CSS** (with Jøkul preset) for UI (see `tailwind.config.js`).
- **State management** and data fetching via **TanStack Query**.

## Key Architectural Patterns
- **Pages**: Main UI pages in `src/pages/` (e.g., `Leaderboard.tsx`, `Profile.tsx`, `NewMatch.tsx`).
- **Routes**: Defined in `src/routes/` using TanStack Router's file-based convention. Route tree is auto-generated in `src/routeTree.gen.ts`.
- **Components**: Reusable UI in `src/components/` (organized by domain, e.g., `common/`, `player-metrics/`).
- **Business Logic**: All core logic/services in `src/lib/` (e.g., `dataService.ts`, `eloService.ts`, `matchService.ts`).
- **Types**: Centralized in `src/types/`.
- **Styling**: Use Tailwind classes and Jøkul components. For complex styles, use SCSS in `src/styles/`.

## Developer Workflows
- **Install**: `pnpm install`
- **Dev server**: `pnpm dev`
- **Build**: `pnpm build`
- **Test**: `pnpm test` (Vitest, see `src/lib/__tests__/`)
- **Type check**: `pnpm types:check`
- **Lint**: `pnpm lint` (ESLint config in `eslint.config.js`)
- **Format**: `pnpm prettier` (Prettier config in `prettier.config.js`)

## Project Conventions
- **Naming**: PascalCase for components/types, camelCase for variables/functions, ALL_CAPS for constants.
- **Routing**: Use file-based routes in `src/routes/`. Route params use `$` (e.g., `profil.$id.tsx`).
- **Data Fetching**: Use TanStack Query hooks. Query client is provided at the root (`src/main.tsx`).
- **Environment**: Read from `env.ts` and Vite env variables. Do not hardcode secrets.
- **Testing**: Place unit tests in `src/lib/__tests__/`. Use Vitest and Testing Library.
- **UI**: Prefer Jøkul components. Use Tailwind for layout/utility, SCSS for complex cases.
- **Language**: Norwegian text is used throughout the UI.

## Integration Points
- **Supabase**: All DB access via `src/lib/supabase.ts` and `dataService.ts`.
- **ELO Calculation**: Handled in `eloService.ts`.
- **Confetti/Effects**: See `src/utils/confetti.ts` for celebratory UI.

## Examples
- To add a new page: create a file in `src/pages/`, add a route in `src/routes/`, and export a component.
- To fetch data: use hooks from `src/hooks/` or TanStack Query directly.
- To add a new type: extend `src/types/pong.ts` and re-export from `src/types/index.ts`.

## References
- See `README.md` for more details on setup, structure, and rules.
- See `.github/instructions/general.instructions.md` for enforced conventions.
