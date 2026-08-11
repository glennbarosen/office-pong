# H7 — Constants & Norwegian string centralization

**Status:** not started
**Depends on:** H1. Independent of everything else — pick up anytime
**Touches:** `src/lib/eloService.ts`, `src/lib/validation.ts`, `src/lib/matchService.ts`, `src/types/pong.ts`, `README.md`, plus string call sites across `src/`
**Est. size:** M

## Why

`RATING_CONFIG` (`src/types/pong.ts:50-54`) exists to hold the game's tunable rules, but most of them escaped it: the ELO divisor, the rating-tier thresholds, every score rule, and the name-length bounds are all hardcoded at their use sites — and the starting ELO is re-hardcoded in two UI files. `AGENTS.md` says the match rules are enforced in `validation.ts`/`eloService.ts`/`matchService.ts` and shouldn't be reimplemented inline; that's mostly true for *logic* but not for the *numbers*.

While consolidating, you'll hit a genuine contradiction: the win-by-2 rule's code and its own comment disagree. That needs a decision, not a refactor — see task 2.

This is the lowest-priority batch. Nothing here is a bug (except task 2's ambiguity), and it's safe to defer.

## Tasks

### 1. Pull the magic numbers into config

Extend `RATING_CONFIG` (or add a sibling `MATCH_RULES`) in `src/types/pong.ts` and replace these:

- [ ] ELO divisor `400`, hardcoded twice — `src/lib/eloService.ts:22,23`.
- [ ] Rating-tier thresholds `1800` / `1600` / `1400` / `1200` — `src/lib/eloService.ts:65-68`. Note the tier names are English ("Grandmaster", "Master", …) while the UI is Norwegian; `getRatingTier` is currently only referenced by tests, so decide whether it's headed for UI (H8 has a tier-badge idea) and translate accordingly.
- [ ] Score bounds and rules in `src/lib/validation.ts`: max `99` (`:20,25`), winning score `11` (`:31,48,55`), margin `2` (`:42`), the deuce thresholds `9` and `10` (`:49,56`).
- [ ] Name length `2` and `50` (`src/lib/validation.ts:75-76`).
- [ ] Starting ELO `1200` re-hardcoded in the UI — `src/components/player-metrics/usePlayerMetricsData.ts:70` and `PlayerMetrics.tsx:42`. (H4 also flags these; whoever gets there first wins.)
- [ ] `src/pages/NewMatch.tsx:80` hardcodes the prose "minimum 5 kamper" instead of interpolating `RATING_CONFIG.MINIMUM_MATCHES_FOR_RANKING`. This is the exact failure mode this batch prevents: change the config and the UI lies.

Keep `as const`. The existing tests (`src/lib/__tests__/eloService.test.ts`, `validation.test.ts`) hardcode expected values — that's fine and arguably correct for tests, so don't rewrite them to use the config, or they'd stop catching config regressions.

### 2. Resolve the win-by-2 contradiction — decision needed

`src/lib/validation.ts` has a comment and an implementation that disagree:

- `:53` says *"winner must win by exactly 2"*
- `:55-57` implements `if (maxScore > 11) return minScore >= 10 && margin >= 2`

So a **20-10 score currently validates**: `maxScore` 20 > 11, `minScore` 10 ≥ 10, margin 10 ≥ 2. Real table tennis deuce games end at exactly +2 (12-10, 13-11, 14-12), which is what the comment describes and what the listed examples at `:54` show.

`README.md:25` says "must win by at least 2 points", which matches the loose code. So two of the three sources agree with each other and the third is the most specific.

- [ ] **Confirm the intended rule before changing anything.** If deuce should be exactly +2, tighten `:56` to `margin === 2 && minScore >= 10` — but that's a behavior change that will reject scores people may have been entering, so it needs a human's sign-off, not a refactor decision.
- [ ] Whatever you decide, make the code, the comment, `README.md:25`, and the error message at `:63` all say the same thing.
- [ ] Update `src/lib/__tests__/validation.test.ts` to cover the boundary explicitly — 12-10 valid, 20-10 whichever it now is, 11-10 invalid.
- [ ] If H2 already added the win-by-2 CHECK constraint to the database, update `db/migrations/` to match. H2 was told to encode current code behavior; if you tighten the rule, the constraint needs to follow (and existing rows may now violate it — check before altering).

Also while you're here: the `>= 11` refine at `:31-34` is fully subsumed by the larger refine at `:35-66` (which returns `false` for any `maxScore < 11` at `:60`). Its only value is a more specific error message. Keep it or fold it in deliberately, but note that the max/min score math is recomputed across three separate refines (`:31`, `:37-38`).

### 3. De-duplicate matchService

- [ ] `src/lib/matchService.ts:43-72` and `:76-105` are near-verbatim copies — the player-1 and player-2 resolve-or-create blocks. Extract one helper taking a side label ("Spiller 1" / "Spiller 2") and call it twice. That's ~30 duplicated lines, and it's where the Norwegian error prefixes at `:50` and `:83` get built.
- [ ] The name-uniqueness check appears at `matchService.ts:54,87` (via `validateUniquePlayerName`) and again inside `createNewMatchSchema` — the latter is deleted by H1, so verify it's gone rather than de-duplicating a corpse.
- [ ] The same-player check exists at `matchService.ts:108` and `validation.ts:136`; `isSamePlayer` in `gameUtils.ts:81` was a third copy that H1 deletes.

If H2 landed first, this file's shape changed (player creation moved server-side). Re-read it before extracting.

### 4. Centralize the Norwegian strings

No i18n library, and there shouldn't be one — this is a Norwegian-only internal tool. A constants module is the right size.

- [ ] Start with **error messages**, which are duplicated across `src/lib/matchService.ts` and `src/lib/validation.ts` and are the strings most likely to drift. `validation.ts` has ~16 of them clustered together already; that's nearly a message catalog.
- [ ] UI copy is inline across ~10 files (`src/pages/Overview.tsx:46,50,63,84,129,130`; `NewMatch.tsx:77,79-82,124,127,131`; `PlayerCard.tsx:35,43,51,60,68,69,79`; `Profile.tsx:24,25,45,50-59`; `LoadingSpinner.tsx:6`). **Be pragmatic here** — hoisting every JSX string into a constants file makes components harder to read for no real benefit in a single-locale app. Prioritize strings that appear more than once or that encode a rule (like the "minimum 5 kamper" case in task 1).
- [ ] Keep Norwegian text, English identifiers, per `AGENTS.md`.

### 5. Fix the README's inaccuracies

- [ ] **`README.md:15` claims "bottom navigation".** There is none — `rg '<nav'` over `src/` is empty. Navigation is a header (`src/components/header/Header.tsx`), a "← Hjem" link (`src/routes/__root.tsx:44-48`), and "Se alle" buttons (`src/pages/Overview.tsx:77,121`). Either fix the README or file it as a feature; don't leave it describing something that doesn't exist.
- [ ] `README.md:16` says the leaderboard requires a minimum of 5 matches, implying exclusion. Ineligible players *are* listed — sorted last with a "Mangler kamper" tag (`src/utils/gameUtils.ts:11-18`, `src/pages/Overview.tsx:60-64`). Reword.
- [ ] The project structure at `README.md:114-120` omits the `player-card/` and `player-metrics/` component folders — 7 files, the largest component area in the repo.
- [ ] `README.md:1` says "Office Pong Leaderboard" while the UI header says "Fremtind kontorpong 🏓" (`src/components/header/Header.tsx:10`). Pick one name.
- [ ] Re-check `README.md:25` against whatever task 2 decided.

## Out of scope

| Tempting to fix | Owned by |
|---|---|
| Chart/page component dedup, moving inline types to `pong.ts` | H4 |
| Adding a real i18n library | Nobody — out of scope by design for a single-locale internal tool |
| Deleting `getRatingTier` because only tests use it | Keep it; see task 1 and H8 |
| Renaming the app | Ask first — `README.md:1` vs the UI header is a branding question, not a code question |

## Verify

```bash
pnpm types:check && pnpm lint && pnpm prettier:check && pnpm vitest run
```

The constants sweep is mechanical, so the tests are the real check — `eloService.test.ts` and `validation.test.ts` assert concrete numbers and will catch a mistyped threshold.

- **Prove the config is actually wired up:** temporarily change `MINIMUM_MATCHES_FOR_RANKING` from 5 to 3, run `pnpm dev`, and confirm both the leaderboard eligibility *and* the "minimum N kamper" text on `/ny-kamp` change together. Revert. Do the same for `STARTING_ELO` and check the profile chart baseline.
- **Task 2's boundaries** by hand on `/ny-kamp`: 11-9 valid, 11-10 invalid, 12-10 valid, 20-10 — whatever you decided, and make sure the error message says the right thing.
- Register a match with a duplicate player name and confirm the error still reads correctly after the matchService extraction — the "Spiller 1:" / "Spiller 2:" prefixes are easy to lose.
- Read `README.md` start to finish against the running app and confirm every claim holds.
