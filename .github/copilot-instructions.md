# Copilot Instructions for Office Pong Leaderboard

Full architecture, conventions, commands, and gotchas: see [`AGENTS.md`](../AGENTS.md) at the repo root — read it first.

Highest-value traps, in case you don't open the file above:

- Server functions use `createServerFn(...).inputValidator()`, **not** `.validator()`.
- This is TanStack **Start** (SSR) now, not a plain TanStack Router SPA — guard browser-only APIs (`localStorage`, `window`) with `typeof window === 'undefined'`.
- DB access is Postgres via raw `pg` queries in `src/lib/server/`, not Supabase — there's no ORM and no migration tool, only `db/init.sql`.
