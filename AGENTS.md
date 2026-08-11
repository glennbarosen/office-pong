# AGENTS.md — Office Pong Leaderboard ("Kontorpong")

Mobile-first, trust-based ELO ping-pong leaderboard for the office. Norwegian UI text, English code identifiers, no auth. Feature/rules/deployment detail: see `README.md`.

> **Planned work lives in [`docs/handoff/INDEX.md`](./docs/handoff/INDEX.md).** It
> is the only record of which improvement batches are done, in progress, or
> still open, and which branch carries each one. Read it before starting
> anything non-trivial, and update it as part of the same PR — a batch marked
> done in one branch and nowhere else is invisible to whoever comes next.

## Stack

React 18 + TypeScript, **TanStack Start** (full-stack SSR, migrated off a plain TanStack Router SPA), Vite 7 + Nitro (`node` preset, builds to `.output/`), TanStack Query (server state), raw **PostgreSQL via `pg`** (no ORM), Zod, Jøkul design system + Tailwind (Jøkul preset) + SCSS, Vitest + Testing Library.

## Architecture map

- `src/routes/` — thin, file-based route wrappers (params use `$`, e.g. `profil.$id.tsx`). `__root.tsx` renders the full `<html>` document for SSR.
- `src/routeTree.gen.ts` — **generated, never hand-edit**.
- `src/pages/` — actual page UI, one per route.
- `src/lib/server/*.ts` — `createServerFn` definitions, the only place DB access happens: `db.ts` (`pg.Pool` singleton), `players.ts`, `matches.ts`.
- `src/lib/{eloService,matchService,validation}.ts` — pure business logic, no server/DOM dependency.
- `src/hooks/*` — TanStack Query hooks wrapping the server functions (`usePlayers`, `useMatches`) plus `useTheme`. Components always go through these — never call a server function or `fetch` directly from a component.
- `src/components/` — domain-grouped folders, barrel-exported via `src/components/index.ts`.
- `src/types/pong.ts` — all domain types; extend here and re-export via `src/types/index.ts`, don't declare ad hoc types in components.

## Commands

`pnpm dev` / `build` / `start` / `preview` / `lint` / `test` / `types:check` / `prettier` / `prettier:check`.

Local Postgres via Docker Compose: `pnpm db:up` (starts it, applies `db/init.sql` on first run), `pnpm db:down`, `pnpm db:reset` (wipes + recreates), `pnpm db:logs`.

## Database

Schema lives in `db/init.sql` (`players`: id, name, avatar, elo_rating, matches_played, wins, losses, created_at, last_played_at; `matches`: id, player1_id, player2_id, winner_id, loser_id, player1_score, player2_score, played_at, elo_changes jsonb). No migration tool — schema changes are hand-edited directly in that file; there's no versioned migration history. `DATABASE_URL` env var, see `.env.example`.

## Conventions

- Naming: PascalCase (components/types), camelCase (vars/functions), ALL_CAPS (constants).
- Prefer Jøkul components over raw HTML; Tailwind for layout, SCSS only for genuinely complex styling.
- Match rules (first to 11, win by 2, 1200 starting ELO, K-factor 32, min 5 matches to rank) are enforced in `validation.ts`/`eloService.ts`/`matchService.ts` — read those before touching match or ELO logic, don't reimplement the rules inline.

## Gotchas

- `createServerFn(...).inputValidator()` — **not** `.validator()`. The latter is an older API name common in training data; using it silently breaks (root cause of a past bug, see `src/lib/server/matches.ts` for the correct usage).
- SSR: guard any browser-only API (`localStorage`, `window`) with `typeof window === 'undefined'` — see `src/hooks/useTheme.ts`.
- No test-render helper exists yet for mounting components with router/query providers — only pure-logic tests exist today (see Testing below). Write one if you add component/route tests; don't assume one is already there.

## Testing

`pnpm test` runs Vitest in watch mode. Only `src/lib/__tests__/` has tests today (pure business logic — elo, match validation). No component/route tests exist. **No Playwright/E2E framework is installed** — don't assume E2E coverage exists or add one unprompted.
