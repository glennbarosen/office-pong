# H4 — Page & component dedup, shared types

**Status:** done, on branch `handoff-h3-h7`
**Depends on:** H1; best done after H3 (loading states interact with route loaders)
**Touches:** `src/pages/**`, `src/components/**`, `src/types/pong.ts`
**Est. size:** L

> **Line references verified against `main` (2026-08-11, at `9935591`).** H2 reworked
> `Matches.tsx` and every file in `player-metrics/`; H6's
> `noUncheckedIndexedAccess` changed the shape of the chart casts. Numbers below
> are post-stack. `Overview.tsx`, `Leaderboard.tsx` and `Profile.tsx` are
> untouched by the stack, so their references are unchanged from the audit.

## Why

`Overview.tsx` reimplements chunks of both `Leaderboard.tsx` and `Matches.tsx` rather than sharing components, three pages copy-paste the same `isLoading` guard, no page handles `isError` at all, and the chart components carry three copies of the same Recharts tooltip. There's also a user-visible bug: `Profile.tsx` renders "Spiller ikke funnet" for a beat on every profile load.

Several types are declared inline in components even though `AGENTS.md` says all domain types belong in `src/types/pong.ts` — and in one case the correct type is already defined there and simply unused.

## Tasks

### 1. Fix the Profile false-negative flash

`src/pages/Profile.tsx:15-16` defaults both queries to `[]`, so on first render `players.find(...)` at `:18` returns `undefined` and the not-found screen at `:20-29` renders — before any data has arrived. Every profile visit flashes "Spiller ikke funnet".

- [x] Guard on `isLoading` before the `!player` check. The other three pages already do this (`Leaderboard.tsx:20`, `Matches.tsx:68`, `Overview.tsx:38`).
- [x] That guard is itself a 3× copy-paste — extract it. Landed as `src/components/common/QueryState.tsx`, used by all five list/form pages (the doc named four; `/ny-kamp` needed the same guard for its player dropdown, added alongside).
- [x] H3 added a `notFoundComponent`; the genuine not-found case (an id that matches no player) now routes there via `profil.$id.tsx`'s loader throwing `notFound({ data: PLAYER_NOT_FOUND })`, giving a real HTTP 404. Profile's in-page `!player` branch stays as a fallback for the case the loader can't catch — a player deleted while the page is open — sharing the wording via `src/lib/messages.ts` so the two can't drift.

**Verified:** against a production server (`pnpm build && pnpm start`), a real profile returned 200 with no "Spiller ikke funnet" text anywhere in the response; `/profil/00000000-...` (unknown id) returned a genuine HTTP 404 with that text.

### 2. Handle query errors

`rg 'isError|error' src/pages/` returns nothing. Because every page defaults `data` to `[]`, a failed fetch renders a cheerful empty state — "no matches yet" when the truth is "the database is down".

- [x] Surface `isError` in all four pages (plus `/ny-kamp`, see task 1), via `QueryState`. Uses `@fremtind/jokul/message`'s `ErrorMessage` with `role="alert"`.
- [x] Include a retry affordance — `refetch` from the query result. `QueryState` refetches only the queries that actually failed, not every query on the page.

**Verified:** stopped the local Postgres container (`pnpm db:down`) and hit `/`, `/ledertavle`, `/kamper`, `/ny-kamp` against the production server — each returned HTTP 500 rendering the app's Norwegian error screen (see H3's route-boundary `defaultErrorComponent`, added because a failing *loader* is a different failure path than a failing in-page refetch), not an empty-list message. Restarted the database and confirmed the pages recovered.

### 3. De-duplicate Overview

`src/pages/Overview.tsx` is largely a reimplementation of the other two list pages:

- [x] `:51-75` duplicates the leaderboard row from `Leaderboard.tsx:44-64` → extracted `src/components/leaderboard/LeaderboardCard.tsx`.
- [x] `:85-119` duplicates the match row from `Matches.tsx:91-129`, which itself overlaps `src/components/match-card/MatchCard.tsx` → consolidated on `MatchCard`, which now renders in two modes (player-centric, for a profile's history; neutral "A vs B", for the overview) rather than having a separate inline version.
- [x] `:127-132` inlines an empty state instead of using the existing `EmptyState` component → now `<EmptyState {...NO_PLAYERS_EMPTY_STATE} />` (the constant, shared with `Leaderboard.tsx`, was added in H7.4 once the two were confirmed byte-identical).
- [x] `Leaderboard.tsx` and `Matches.tsx` share an identical table + `collapseToList` + `useElementDimensions` skeleton → extracted `src/components/common/CollapsibleTable.tsx`.

Overview shows only the top 5 and last 5; both extracted components take a `rank`/list-slicing approach from the page rather than an internal limit prop — the page slices before rendering.

**Verified behavior-preserving**, not just by inspection: diffed the SSR-rendered text of `/`, `/ledertavle`, `/kamper` and a profile against the pre-dedup commit's build. The only differences were `OVERVIEW_LIMIT`-interpolated headings splitting across text nodes (identical on screen) and profile match dates switching from `11.8.2026` to `11. aug. 2026` because the consolidated `MatchCard` now goes through `formatDate` (task 5's item, landing here since the file was already being rewritten).

### 4. Move inline types into `src/types/pong.ts`

`AGENTS.md`: "all domain types; extend here and re-export via `src/types/index.ts`, don't declare ad hoc types in components."

- [x] `MatchWithPlayerNames` is gone. **Decision: adopted `MatchWithPlayers`** (the richer option, `player1`/`player2`/`winner`/`loser` as full `Player` objects) rather than moving the name-only variant across — it's what H8's head-to-head work would want, and gives row components ids for links via `player1.id`. `Matches.tsx` and `Overview.tsx` both build it via a new `resolveMatchPlayers` helper in `gameUtils.ts`. Per-player ELO deltas are **not** fields on it — callers read `eloChanges` keyed by the player id, which under `noUncheckedIndexedAccess` types as `number | undefined` and so keeps the `+NaN` bug impossible by construction rather than by convention.
- [x] `OpponentStats` and `EloHistoryPoint` moved to `pong.ts`. `OpponentStats` absorbed the unused `HeadToHeadRecord` — it now carries `opponent: Player` (not a flat id/name pair), reconciling the two rather than keeping both.
- [x] `ChartColors` and a new `SelectOption` went to `src/types/ui.ts`, a sibling file, not `pong.ts` — a colour palette and a select-option shape are presentation, not domain, and `AGENTS.md` reserves `pong.ts` for domain types. `src/types/index.ts` re-exports both files.

### 5. Reuse existing utilities instead of recomputing

- [x] `Profile.tsx` no longer recomputes `winRate` / `isEligibleForRanking` — both come from `createLeaderboardEntries([player])[0]` now.
- [x] All four `toLocaleDateString('no-NO')` call sites route through `formatDate`.
- [x] Dropped the redundant client-side sorts in `Matches.tsx` and `Profile.tsx` — the query already returns `ORDER BY played_at DESC`.
- [x] `Profile.tsx` now passes the pre-filtered `playerMatches` to `PlayerMetrics` instead of the full match list.
- [x] Deleted the defensive `String()`/`.trim()` id comparison in `usePlayerMetricsData.ts`.

### 6. De-duplicate the chart components

In `src/components/player-metrics/`:

- [x] Extracted `ChartTooltip` (+ `ChartTooltipRow`), used by all three charts. It resolves colours from `chartColors` instead of the hardcoded `#1f2937`/`#4b5563` the three copies carried, so tooltips now follow the theme in light mode too.
- [x] Extracted `axisProps` / `categoryAxisProps` / `yAxisWidth` in `chartAxes.ts`.
- [x] The ELO-history derivation exists once now (`deriveEloHistory` in `usePlayerMetricsData.ts`), with the proportional back-adjustment behind a `reconcileToCurrentRating` flag — on for a player's full history, off for a curve filtered to one opponent (which was never expected to end at the overall rating; that's exactly why there were two loops before).
- [x] Tooltip payload narrowing is now one generic, `firstPayload<T>()` in `chartPayload.ts` (a separate file from the tooltip components, to satisfy `react-refresh/only-export-components`), preserving the optional-index handling `noUncheckedIndexedAccess` requires.
- [x] `stats.get(opponentId)!` is gone — the map is seeded with `??` instead of a get-then-assert.

### 7. One source of truth for theme, breakpoints, and starting ELO

- [x] Theme is read one way now: `useThemeColors` and `PlayerMetrics` both consume `useTheme()` instead of their own `MutationObserver`/`getAttribute` reads.
- [x] `useThemeColors` resolves Jøkul's `--jkl-color-*` custom properties via `getComputedStyle` (with hex fallbacks for SSR and the pre-effect tick) instead of a hardcoded palette. Read via `getComputedStyle` rather than passed as `var(...)` because Recharts writes colours as SVG presentation attributes, where `var()` doesn't resolve.
- [x] Breakpoints: `MOBILE_BREAKPOINT` (640) and `TABLE_COLLAPSE_WIDTH` (1000) now live in `src/constants/layout.ts`, each with a comment explaining why they're two constants rather than one (a viewport question for chart sizing vs. a container-width question for the table). `useIsMobile` moved to `src/hooks/` (where `AGENTS.md` says hooks live) and switched from a resize listener to `matchMedia`.
- [x] `STARTING_ELO` re-hardcoding fixed in both files named (one went with H4.6's dedup, the other reads `RATING_CONFIG.STARTING_ELO` directly).

### 8. Consistency

- [x] `NewMatch.tsx` is now a named export; `ny-kamp.tsx` updated to match.
- [x] `src/components/index.ts` deleted rather than adopted — 2 files used it, 26 used deep paths, so deep paths were already the de-facto convention. `AGENTS.md` now documents the decision.

## Out of scope

| Tempting to fix | Owned by |
|---|---|
| ARIA attributes, skip links, reduced-motion, loading **skeletons** | H5 — landed after H4 in the same session, no overlap issues |
| Route-level `pendingComponent` / `notFoundComponent` | H3 |
| The remaining magic numbers (score rules, tier thresholds, Norwegian strings) | H7 |
| Server-side leaderboard/profile queries replacing the client-side joins | H8 |

## Verify

```bash
pnpm types:check && pnpm lint && pnpm prettier:check && pnpm vitest run
```

All pass (64 tests including a new `QueryState` suite covering all three branches — pending/error/success — and that retry refetches only the failed queries).

- [x] **The Profile bug:** verified against the production server directly (not devtools throttling) — see task 1.
- [x] Visited `/finnes-ikke` and `/profil/00000000-...` and confirmed genuine not-found renders with HTTP 404 in both cases.
- [x] **Error states:** verified with the database stopped — see task 2.
- [x] Compared `/` against `/ledertavle` and `/kamper` via an SSR text diff — see task 3.
- [ ] **Chart tooltips in light/dark:** not visually verified in a real browser — no browser automation was available this session. The colour resolution was confirmed correct by computing the actual `--jkl-color-*` hex values Jøkul defines per theme and checking `useThemeColors`' mapping references real tokens, but nobody has looked at a rendered tooltip.
- [ ] **Mobile breakpoint collapse / theme toggle while charts are visible:** not run for the same reason.

**Residual:** the two unchecked items need a real browser. They're lower-risk than H3's residual items — the underlying logic (constant values, colour token names) was checked, just not the pixels.
