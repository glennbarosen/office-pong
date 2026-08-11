# H8 — Feature ideas

**Status:** n/a — this is a menu, not a task list
**Depends on:** nothing
**Touches:** nothing yet
**Est. size:** per idea, below

## Why

The audit that produced this queue was about code health, but it surfaced a few things that look like unfinished intent: a `HeadToHeadRecord` type nobody uses, an `avatar` column nobody writes to, and an ELO tier system reachable only from tests. Those are cheap wins. The rest below are ideas ranked by value-to-effort for an office leaderboard.

**Nothing here is approved.** Pick one, then write it up as its own handoff doc (or just build it) — these entries are sized sketches, not specs.

## Ranked candidates

### 1. Head-to-head records on the profile — S

"Am I beating Marius?" is the single most asked question of any office ladder, and the groundwork already exists.

- `HeadToHeadRecord` is fully defined at `src/types/pong.ts:40-47` (opponent, wins, losses, winRate, totalMatches, lastMatch) and **used nowhere**.
- `src/components/player-metrics/usePlayerMetricsData.ts:20-50` already aggregates per-opponent stats to feed `OpponentStatsChart` — it computes most of this and throws the rest away.
- H4 is asked to reconcile `OpponentStats` (`player-metrics/types.ts:9`) with `HeadToHeadRecord`; doing that lands most of this feature's data layer.

Mostly a presentation task: a table on `/profil/$id` listing every opponent faced with the W-L record.

### 2. Match undo / delete — M, needs a decision

In a trust-based app with no auth and free-text score entry, fat-fingered scores are inevitable and currently permanent. This is the most-requested feature of every leaderboard like this.

The hard part isn't the delete, it's the ELO: ratings are path-dependent, so removing match #40 of 60 invalidates every subsequent calculation. Two viable designs:

- **Replay** — delete the row, then recompute all ratings from `RATING_CONFIG.STARTING_ELO` forward. Correct, simple to reason about, and trivially fast at office scale (hundreds of matches). Needs a transaction and a `players` reset step.
- **Compensating adjustment** — apply the inverse of the stored `elo_changes` (`matches.elo_changes` already records the deltas per player). Cheap, but drifts from what a full replay would produce.

Recommend replay. Also requires deciding `ON DELETE` behavior on the four `matches` FKs (`db/init.sql:17-20`), which currently have no action specified — see idea 6.

A softer variant: allow editing a match only within N minutes of creation, which covers the actual use case (typo caught immediately) at a fraction of the complexity.

### 3. Server-side leaderboard & profile queries — M

Every page currently downloads the entire `players` and `matches` tables and joins them in JavaScript:

- `src/pages/Overview.tsx:21-36` — needs top-5 and last-5, fetches everything.
- `src/pages/Profile.tsx:32-34` — filters all matches client-side to find one player's.
- `src/lib/server/matches.ts:8` — `SELECT` with no `LIMIT`.

Fine at 20 players and 200 matches; not fine at 2000 matches. H2's indexes are the prerequisite that makes the SQL version fast. Pairs naturally with idea 4.

### 4. Pagination or infinite scroll for `/kamper` — S

Direct consequence of the above. `getMatches` has no `LIMIT`, so the match list grows unboundedly and every page load ships the whole history. TanStack Query's `useInfiniteQuery` plus a keyset cursor on `played_at` (indexed by H2) is the clean version.

### 5. Streaks and recent form — S

Both derivable from existing data with no schema change:

- Current win/loss streak per player, shown on the leaderboard.
- Last-5 form indicator (`WWLWW`) on the leaderboard and profile.

High visible value per line of code. The aggregation belongs in `src/utils/gameUtils.ts` next to `createLeaderboardEntries`, with tests — H6 notes that file currently has zero coverage.

### 6. Player deactivation — S

People leave the office, and their stale entries clutter the leaderboard. Because the four `matches` FKs have no `ON DELETE` action, a player **can never be deleted** today — which is arguably correct, since deleting them would destroy match history.

A soft `active` boolean (default true) sidesteps the whole problem: hide inactive players from the leaderboard, keep their matches intact, keep their profile reachable. This is the cheapest answer to both "remove this person" and "never break history."

### 7. Avatars — S

`players.avatar` exists in the schema (`db/init.sql:6`), is mapped through to the `Player` type (`src/types/pong.ts:4`, `src/lib/server/players.ts:14`), and is **never written or displayed**. Someone clearly intended this.

Cheapest useful version: derive initials-with-a-color from the player name, no upload, no storage, no moderation question. If real image upload is wanted, that's a much larger conversation (where do files live on Dokku?) and should be its own doc.

### 8. Rating tiers in the UI — XS

`EloService.getRatingTier` (`src/lib/eloService.ts:60-69`) returns a tier name and a bronze/silver/gold/platinum color, and is referenced **only by its test**. Surfacing it as a badge on the leaderboard and profile is nearly free.

Two caveats: the tier names are English ("Grandmaster", "Master", "Expert", "Novice") in an otherwise Norwegian UI, and the thresholds are hardcoded (H7 moves them into config). Translate before shipping.

### 9. Seasons / periodized leaderboards — L

The biggest of these. An "all-time" ladder gets stale and discourages new players; quarterly seasons reset the stakes.

Needs a `seasons` table and a `season_id` on `matches`, a decision about whether ratings reset or carry over with regression toward the mean, and UI for switching between the current season and history. This is the one idea here that genuinely warrants a design doc before any code — and the one most likely to be worth it if the ladder is actually active.

### 10. Small stuff

- **Match-result share image** — an OG image or shareable card for a just-registered match. Fun, self-contained, no schema change.
- **Stats consistency repair tool** — a script verifying `wins + losses = matches_played` and that `elo_rating` matches a full replay, since nothing enforces either today. H2 adds a CHECK constraint for the first; this catches pre-existing drift. Naturally shares its replay logic with idea 2.
- **Backfill `elo_changes`** — rows created before that column was populated hold the default `'{}'` and render `+NaN` on `/kamper` (H6 surfaces this via `noUncheckedIndexedAccess`). A replay could reconstruct real values.

## If you pick one

Write it up as `H9-<name>.md` using the same template as the other docs in this directory, add a row to `INDEX.md`, and note which of H1–H7 it depends on. Ideas 1, 5, 7, and 8 are all small enough to just build; 2, 3, 4, and 6 want a short design note first; 9 wants a real one.
