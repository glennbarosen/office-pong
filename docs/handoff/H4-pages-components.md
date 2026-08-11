# H4 — Page & component dedup, shared types

**Status:** not started
**Depends on:** H1; best done after H3 (loading states interact with route loaders)
**Touches:** `src/pages/**`, `src/components/**`, `src/types/pong.ts`
**Est. size:** L

## Why

`Overview.tsx` reimplements chunks of both `Leaderboard.tsx` and `Matches.tsx` rather than sharing components, three pages copy-paste the same `isLoading` guard, no page handles `isError` at all, and the chart components carry three copies of the same Recharts tooltip. There's also a user-visible bug: `Profile.tsx` renders "Spiller ikke funnet" for a beat on every profile load.

Several types are declared inline in components even though `AGENTS.md` says all domain types belong in `src/types/pong.ts` — and in one case the correct type is already defined there and simply unused.

## Tasks

### 1. Fix the Profile false-negative flash

`src/pages/Profile.tsx:15-16` defaults both queries to `[]`, so on first render `players.find(...)` at `:18` returns `undefined` and the not-found screen at `:20-29` renders — before any data has arrived. Every profile visit flashes "Spiller ikke funnet".

- [ ] Guard on `isLoading` before the `!player` check. The other three pages already do this (`Leaderboard.tsx:20`, `Matches.tsx:56`, `Overview.tsx:38`).
- [ ] That guard is itself a 3× copy-paste — extract it. A small `<QueryState>` wrapper (or a hook returning a status discriminant) that handles loading / error / empty in one place, used by all four pages.
- [ ] If H3 added a `notFoundComponent`, route the genuine not-found case there instead of rendering it inline.

### 2. Handle query errors

`rg 'isError|error' src/pages/` returns nothing. Because every page defaults `data` to `[]`, a failed fetch renders a cheerful empty state — "no matches yet" when the truth is "the database is down".

- [ ] Surface `isError` in all four pages, via the shared wrapper from task 1. Use a Jøkul message component (`@fremtind/jokul/message` is already imported in `Profile.tsx:8`).
- [ ] Include a retry affordance — `refetch` from the query result.

### 3. De-duplicate Overview

`src/pages/Overview.tsx` is largely a reimplementation of the other two list pages:

- [ ] `:51-75` duplicates the leaderboard row from `Leaderboard.tsx:44-64` → extract a shared row/list component.
- [ ] `:85-119` duplicates the match row from `Matches.tsx:78-118`, which itself overlaps `src/components/match-card/MatchCard.tsx` → consolidate on one match-row component.
- [ ] `:127-132` inlines an empty state instead of using the existing `EmptyState` component (`src/components/common/EmptyState.tsx`).
- [ ] `Leaderboard.tsx` and `Matches.tsx` share an identical table + `collapseToList` + `useElementDimensions` skeleton — factor that out too.

Overview shows only the top 5 and last 5, so the extracted components need a limit prop or the page slices before rendering.

### 4. Move inline types into `src/types/pong.ts`

`AGENTS.md`: "all domain types; extend here and re-export via `src/types/index.ts`, don't declare ad hoc types in components."

- [ ] `MatchWithPlayerNames` (`src/pages/Matches.tsx:13-18`) — `Overview.tsx:30-35` builds the same shape anonymously, so at minimum those two should share one named type in `pong.ts`.

  Note the unused **`MatchWithPlayers`** at `src/types/pong.ts:33` is *not* the same shape: it `Omit`s the four id fields and replaces them with full `Player` objects, whereas `MatchWithPlayerNames` `extends Match` and adds four name strings alongside the ids. Decide deliberately — either adopt `MatchWithPlayers` (richer, lets the rows render anything about a player, and is what H8's head-to-head work would want) or move the name-only variant into `pong.ts` and delete `MatchWithPlayers`. Don't keep both.
- [ ] `OpponentStats`, `EloHistoryPoint`, `ChartColors` (`src/components/player-metrics/types.ts:9,20,29`). Note `OpponentStats` overlaps `HeadToHeadRecord` (`pong.ts:40`, unused) — reconcile rather than moving both across. H8's head-to-head feature will want the result.
- [ ] The repeated select-option shape `Array<{ value, label }>` (`src/components/player-card/PlayerCard.tsx:12`, `src/components/player-metrics/PlayerMetricsControls.tsx:39-45`) — a shared `SelectOption` type, or Jøkul's own if it exports one.

### 5. Reuse existing utilities instead of recomputing

- [ ] `src/pages/Profile.tsx:36-37` recomputes `winRate` and `isEligibleForRanking` — both already computed by `createLeaderboardEntries` in `src/utils/gameUtils.ts:10-11`.
- [ ] `formatDate` (`src/utils/gameUtils.ts:51`) is bypassed by raw `toLocaleDateString('no-NO')` at `Profile.tsx:45`, `src/components/match-card/MatchCard.tsx:29`, `src/components/player-metrics/usePlayerMetricsData.ts:86`, and `PlayerMetrics.tsx:57`. Route all four through it — it also supports `{ includeTime }` (`gameUtils.ts:59`).
- [ ] Drop redundant client-side sorting: SQL already returns matches `ORDER BY played_at DESC` (`src/lib/server/matches.ts:8`), yet `Overview.tsx:23`, `Matches.tsx:52`, and `Profile.tsx:34` all re-sort.
- [ ] `Profile.tsx:73` passes **all** matches to `PlayerMetrics`, which re-filters them by player (`usePlayerMetricsData.ts:8`) while `Profile.tsx:32` computes the same filter separately. Pass `playerMatches`.
- [ ] Delete the defensive `String()` / `.trim()` id comparison at `usePlayerMetricsData.ts:10-14` — ids are uuids from the database and can't have whitespace or type variance.

### 6. De-duplicate the chart components

In `src/components/player-metrics/`:

- [ ] The custom Recharts tooltip is copy-pasted three times — `EloHistoryChart.tsx:86-96`, `OpponentStatsChart.tsx:66-76`, `WinLossChart.tsx:52-62` — each with hardcoded `#1f2937` / `#4b5563` that **ignore the `chartColors` they're handed**, so tooltips stay dark in light mode. Extract one `<ChartTooltip>` that actually uses the theme colors.
- [ ] Axis configuration (tick/axisLine/tickLine plus `isMobile` sizing) is duplicated between `EloHistoryChart.tsx:44-78` and `OpponentStatsChart.tsx:45-60` — extract shared axis props.
- [ ] The ELO-history derivation loop exists twice: `usePlayerMetricsData.ts:72-91` and `PlayerMetrics.tsx:44-62`. Keep the hook's version, delete the other.
- [ ] The `as EloHistoryPoint` / `as OpponentStats` / `as number` casts (`EloHistoryChart.tsx:84`, `OpponentStatsChart.tsx:64`, `WinLossChart.tsx:65`) exist because Recharts' payload types are loose. Type the tooltip props properly once in the extracted component instead of casting at three call sites.
- [ ] The non-null assertion at `usePlayerMetricsData.ts:44` (`stats.get(opponentId)!`) — restructure so it isn't needed.

### 7. One source of truth for theme, breakpoints, and starting ELO

- [ ] **Theme is read three independent ways:** `src/hooks/useTheme.ts`, a `MutationObserver` on `data-theme` in `useThemeColors.ts:10`, and again in `PlayerMetrics.tsx:72`. Consolidate on the hook (H3 may have reworked it — check).
- [ ] `useThemeColors.ts:36-44` hardcodes a hex palette. Use Jøkul CSS custom properties so the charts follow the design system.
- [ ] **Breakpoints conflict:** `useIsMobile.ts:8` uses 640px, while `Leaderboard.tsx:13-15` and `Matches.tsx:27-29` independently use `useElementDimensions(350)` with a `width <= 1000` check (two identical copies). Pick one approach and one constant.
- [ ] `1200` is re-hardcoded as the ELO baseline in `usePlayerMetricsData.ts:70` and `PlayerMetrics.tsx:42` instead of `RATING_CONFIG.STARTING_ELO` (`src/types/pong.ts:51`). Fix these two here since you're in the files; H7 owns the wider constants sweep.

### 8. Consistency

- [ ] `src/pages/NewMatch.tsx:13` is a default export while every other page is a named export. Make it named and update `src/routes/ny-kamp.tsx:2`.
- [ ] `src/components/index.ts` is imported in only two places (`__root.tsx:8`, `NewMatch.tsx:9`); everything else uses deep paths. Pick a convention — either use the barrel consistently or delete it — and note the decision in `AGENTS.md`.

## Out of scope

| Tempting to fix | Owned by |
|---|---|
| ARIA attributes, skip links, reduced-motion, loading **skeletons** | H5 — you'll be in the same JSX, so land H4 first and don't half-do H5's list |
| Route-level `pendingComponent` / `notFoundComponent` | H3 |
| The remaining magic numbers (score rules, tier thresholds, Norwegian strings) | H7 |
| Server-side leaderboard/profile queries replacing the client-side joins | H8 |

## Verify

```bash
pnpm types:check && pnpm lint && pnpm prettier:check && pnpm vitest run
pnpm db:up && pnpm dev
```

The dedup work is behavior-preserving, so verification is mostly visual comparison. Before/after screenshots of each page help.

- **The Profile bug:** hard-reload a `/profil/$id` URL directly (not via navigation) and confirm "Spiller ikke funnet" no longer flashes. Throttle to Slow 3G in devtools to make the window obvious.
- Visit `/profil/does-not-exist` and confirm a genuine not-found still renders.
- **Error states:** stop the database (`pnpm db:down`) and load each of the four pages. Each must show an error, not an empty list. Restart and confirm retry works.
- Compare `/` against `/ledertavle` and `/kamper` — the extracted row components must render identically to before in both places.
- **Chart tooltips in light mode:** open a profile with 5+ matches and hover every chart. Tooltips should now respect the light theme rather than staying dark.
- Resize across the mobile breakpoint on `/ledertavle` and `/kamper` and confirm the table→list collapse still triggers at the same width.
- Toggle the theme while a profile's charts are visible; colors should update without a reload.
