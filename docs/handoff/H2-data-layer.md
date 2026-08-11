# H2 — Data layer correctness & DB hardening

**Status:** done (branch `h2-data-layer`) — production migration not yet run, see below
**Depends on:** H1 (which deletes the `updatePlayer` server fn you'd otherwise have to fix)
**Touches:** `src/lib/server/*.ts`, `src/lib/matchService.ts`, `db/init.sql`, `db/migrations/`, `package.json` (scripts), `AGENTS.md` (Database section)
**Est. size:** L — consider splitting the app-code half and the SQL half into two PRs

## Why

Two of the repo's three real bugs live here. `addMatchWithPlayerUpdates` derives persisted ELO ratings from `Player` objects the browser posted, and new players are inserted outside the transaction that creates their match. Separately, the schema has **zero indexes** beyond the two implicit primary keys and **zero CHECK constraints** — every invariant the app relies on (winner is one of the players, scores are valid, names are unique) is enforced only in TypeScript, so anything that reaches the database by another path can violate it.

This app is deliberately trust-based with no auth, and that's fine. Deriving *stored* state from unvalidated client payloads is a different problem: it isn't an attacker model, it's a correctness model. A user with a stale tab silently writes wrong ratings.

## Tasks

### 1. Stop deriving ELO from client input

`src/lib/server/matches.ts:26-44` accepts `{ matchData, winnerData: Player, loserData: Player }` and calls `EloService.calculateEloChanges(data.winnerData, data.loserData)` on those posted objects, writing the result to `players.elo_rating` at `:70` and `:88`.

- [x] Change the input to ids and scores only — something like `{ player1Id, player2Id, player1Score, player2Score }`. The winner/loser determination is already derivable from the scores (`src/lib/matchService.ts:113-115` does exactly that).
- [x] Inside the existing transaction, load both players with `SELECT ... FROM players WHERE id = ANY($1) FOR UPDATE` and compute ELO from **those** rows. `FOR UPDATE` also serializes two concurrent matches involving the same player, which currently race.
- [x] Keep using `EloService.calculateEloChanges` and `EloService.calculatePlayerUpdates` — the pure logic is correct and tested (`src/lib/__tests__/eloService.test.ts`). Only the *source* of the input changes.
- [x] Update `src/hooks/useMatches.ts:12-31` and `src/pages/NewMatch.tsx` to the new signature.

**Acceptance:** submitting a match from a tab whose player list is stale still produces ratings computed from current DB values.

### 2. Apply the Zod schemas at the server boundary

All three `inputValidator`s are identity pass-throughs: `src/lib/server/players.ts:26`, `players.ts:59` (deleted by H1), `src/lib/server/matches.ts:27-33`. Client data is structurally trusted.

- [x] Validate in `addPlayer`'s `inputValidator` using the existing `playerNameSchema` (`src/lib/validation.ts:71`).
- [x] Validate in the match server fn using the existing `matchScoreSchema` (`src/lib/validation.ts:14`).
- [x] **Reuse those schemas — don't write new ones.** They already encode the rules and are already covered by `src/lib/__tests__/validation.test.ts`. Duplicating them is how the rules drift.
- [x] Remember: `.inputValidator()`, not `.validator()`.

### 3. Move player creation into the match transaction

`src/lib/matchService.ts:58` and `:91` `await addPlayer(...)` as separate round-trips, before the caller invokes `addMatchWithPlayerUpdates`. If the match insert then fails, the new players are already committed and stay behind as orphans with 0 matches.

- [x] Make the whole thing one unit of work. Preferred shape: a single `createMatch` server fn taking either an existing id or a new name per side, which inserts any new players inside the same `BEGIN`/`COMMIT` as the match.
- [x] `MatchService.processMatchCreation` currently takes an `addPlayer` callback (`matchService.ts:29`) precisely to do this client-side. Keep the pure validation/winner-determination logic in `MatchService`, but the insert sequencing moves server-side.
- [x] Preserve the existing Norwegian error messages (`matchService.ts:45,50,55,69,...`) — they're user-facing and `src/lib/__tests__/matchService-validation.test.ts` asserts on some of them.

### 4. Extract row mappers

The `Player` row→domain mapping is written 3× (`src/lib/server/players.ts:10-22`, `:45-55`, and once more in the H1-deleted `updatePlayer`) and the `Match` mapping 2× (`src/lib/server/matches.ts:11-23`, `:101-112`). The `as Player` / `as Match` casts at `players.ts:55` and `matches.ts:112` paper over the fact that `pg`'s `result.rows` is `any[]`.

- [x] Create `src/lib/server/mappers.ts` with explicit `PlayerRow` / `MatchRow` interfaces (snake_case, matching the SQL) and `mapPlayerRow` / `mapMatchRow` functions returning `Player` / `Match`.
- [x] Replace all five mapping sites. The casts should become unnecessary, not relocated.

### 5. Guard result access

- [x] `src/lib/server/players.ts:44` reads `result.rows[0]` with no `rowCount` check. Throw a meaningful error instead of letting `row.id` throw a `TypeError`. Apply the same guard to the new match insert's `RETURNING` read (`matches.ts:101`).

### 6. Configure the connection pool

`src/lib/server/db.ts:3-5` is `new pg.Pool({ connectionString })` and nothing else.

- [x] Add `max`, `idleTimeoutMillis`, `connectionTimeoutMillis`.
- [x] Add a `pool.on('error', ...)` handler. Without one, an idle client erroring out (a Postgres restart, a Dokku redeploy of the DB) emits an unhandled `'error'` event and takes down the Node process.

### 7. Set up `db/migrations/`

There is no migration tooling and no versioned history — `db/init.sql` is hand-edited. That's fine for a fresh install and useless for the deployed database, which already holds real match history.

- [x] Create `db/migrations/` with numbered files: `001_add_indexes.sql`, `002_add_constraints.sql`.
- [x] Write them **idempotently** (`CREATE INDEX IF NOT EXISTS`, and for constraints either guard with a `DO $$ ... IF NOT EXISTS (SELECT FROM pg_constraint ...) $$` block or accept that re-running errors harmlessly — pick one and be consistent).
- [x] Add a `db:migrate` script to `package.json` that applies every file in `db/migrations/` in filename order against `$DATABASE_URL`. A `psql -f` loop is entirely adequate; don't add an ORM or a migration framework for this.
- [x] Apply the same DDL to `db/init.sql` so fresh installs and migrated databases converge.
- [x] Document the production path in this file's Verify section and in `README.md`: `dokku postgres:connect` or a one-off container, then run the migration.
- [x] **Update `AGENTS.md`** — its Database section currently states "No migration tool — schema changes are hand-edited directly in that file; there's no versioned migration history." That stops being true here.

### 8. Migration 001 — indexes

Current state: the only indexes are the two implicit PK indexes on `players.id` and `matches.id`.

- [x] `matches(played_at DESC)` — `getMatches` does `ORDER BY played_at DESC` with no LIMIT on every call (`matches.ts:8`).
- [x] `matches(player1_id)`, `matches(player2_id)` — needed once profile filtering moves server-side; today `src/pages/Profile.tsx:33` filters the whole table client-side.
- [x] `matches(winner_id)`, `matches(loser_id)`.
- [x] `players(elo_rating DESC)` — `getPlayers` orders by it (`players.ts:7`).
- [x] **`CREATE UNIQUE INDEX ON players (lower(name))`** — name uniqueness is enforced only in app code (`src/lib/validation.ts:7`, checked against a client-side player list), so two people registering the same new player concurrently both succeed. Check for existing duplicates first: `SELECT lower(name), count(*) FROM players GROUP BY 1 HAVING count(*) > 1;`

### 9. Migration 002 — CHECK constraints

The schema has none. Add these to `matches`:

- [x] `player1_id <> player2_id`
- [x] `winner_id IN (player1_id, player2_id)` and `loser_id IN (player1_id, player2_id)`
- [x] `winner_id <> loser_id`
- [x] `player1_score >= 0`, `player2_score >= 0`, `player1_score <> player2_score`
- [x] `GREATEST(player1_score, player2_score) >= 11` and a win-by-2 check
- [x] winner's score is the higher one — i.e. `(winner_id = player1_id) = (player1_score > player2_score)`

And to `players`:

- [x] `elo_rating >= 0`, `wins >= 0`, `losses >= 0`, `wins + losses = matches_played`
- [x] `length(trim(name)) BETWEEN 2 AND 50`, mirroring `playerNameSchema` (`validation.ts:74-76`)

**Validate against existing rows before adding each one.** Run the negation as a `SELECT` first — e.g. `SELECT * FROM matches WHERE winner_id NOT IN (player1_id, player2_id);`. If a legacy row violates a constraint, do **not** silently delete or mutate it: report what you found and ask, since match history is the whole point of the app. `NOT VALID` (add the constraint for new rows, skip the backfill check) is a reasonable escape hatch — note it in the migration if you use it.

Be aware the win-by-2 rule as implemented is looser than its own comment claims (`src/lib/validation.ts:53` vs `:56` — 20-10 currently validates). **Encode the current code's behavior**, not the comment's. H7 owns resolving that contradiction; if H7 lands first, match whatever it decided.

### 10. Minor

- [x] Drop the vestigial `eloChanges: {}` the client sends (`src/lib/matchService.ts:125`) — the server recomputes it at `matches.ts:41-44` and never reads the client's value.

## Out of scope

| Tempting to fix | Owned by |
|---|---|
| `ON DELETE` behavior on the 4 `matches` FKs (`db/init.sql:17-20`) — currently absent, so players can never be deleted | Leave as-is. H8's match-undo and player-deactivation ideas own that decision |
| Moving the leaderboard join and profile filtering into SQL | H8 ("server-side leaderboard query") — this batch only adds the indexes that would make it fast |
| Pagination / `LIMIT` on `getMatches` | H8 |
| The module-scope `QueryClient` in `src/router.tsx:5` | H3 |
| Route loaders and SSR prefetch | H3 |

## Verify

```bash
pnpm db:reset          # fresh schema from the updated init.sql
pnpm db:migrate        # should be a no-op on a fresh DB — proves idempotency
pnpm types:check && pnpm lint && pnpm vitest run
```

Then verify the migration path against a database that already has data, which is the case that actually matters:

```bash
pnpm db:up             # existing volume, pre-migration schema
pnpm db:migrate        # should apply cleanly to populated tables
pnpm db:migrate        # run twice — must not error
```

Manual checks with `pnpm dev`:

- Register a match between two existing players. Confirm both ratings change and `matches_played` increments.
- Register a match creating **two** new players at once. Both should exist afterward with correct starting ELO.
- Confirm the transaction rollback: temporarily make the match `INSERT` throw, submit a match with a new player, and verify **no** orphan player row was created (`SELECT * FROM players ORDER BY created_at DESC LIMIT 5;`). Revert the sabotage.
- Try to violate a constraint directly in SQL and confirm the database rejects it:
  ```sql
  INSERT INTO matches (player1_id, player2_id, winner_id, loser_id, player1_score, player2_score)
  SELECT id, id, id, id, 11, 3 FROM players LIMIT 1;   -- must fail
  ```
- Confirm the stale-cache scenario from task 1: open two tabs, register a match in the first, then register a match in the second without refreshing. Ratings must be consistent with the DB, not with tab 2's stale player list.
- Verify the indexes are used: `EXPLAIN ANALYZE SELECT ... FROM matches ORDER BY played_at DESC LIMIT 10;`


## Session note (2026-08-11)

Implemented and verified against a local Postgres. Outstanding for whoever deploys:

- **`pnpm db:migrate` has not been run against production.** It was exercised
  against a database recreated with the pre-migration schema and seeded data:
  it applies cleanly, is a no-op on a second run, and aborts without touching
  anything when data violates a constraint (tested with duplicate names). Run
  the pre-flight SELECTs in `002_add_constraints.sql` first; if one reports
  rows, bring it up rather than editing history.
- `addPlayer` / `useAddPlayer` survive but now have no call site: `NewMatch`
  goes through `createMatch`. Left in place deliberately — H8's ideas may want
  standalone player creation. Delete them if that doesn't materialise.
- The transaction lives in `src/lib/server/matchTransaction.ts`, not
  `matches.ts`. A plain exported function beside a server function ends up in
  the client bundle, which pulled in `pg` and blanked every page with
  "Buffer is not defined". Keep server-only code out of modules the client
  imports.
