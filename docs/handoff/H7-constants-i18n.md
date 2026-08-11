# H7 — Constants & Norwegian string centralization

**Status:** done, on branch `handoff-h3-h7`
**Depends on:** H1. Independent of everything else — pick up anytime
**Touches:** `src/lib/eloService.ts`, `src/lib/validation.ts`, `src/lib/matchService.ts`, `src/types/pong.ts`, `README.md`, plus string call sites across `src/`
**Est. size:** S–M (was M — H2 completed most of task 3)

> **Line references verified against `main` (2026-08-11, at `9935591`).** H2 rewrote
> `validation.ts` and `matchService.ts` wholesale, which invalidated most of this
> doc's original numbers and **completed most of task 3**. Numbers below are
> post-merge. H1, H6 and H2 are now on `main` — branch from there.

## Why

`RATING_CONFIG` (`src/types/pong.ts:50-54`) exists to hold the game's tunable rules, but most of them escaped it: the ELO divisor, the rating-tier thresholds, every score rule, and the name-length bounds are all hardcoded at their use sites — and the starting ELO is re-hardcoded in two UI files. `AGENTS.md` says the match rules are enforced in `validation.ts`/`eloService.ts`/`matchService.ts` and shouldn't be reimplemented inline; that's mostly true for *logic* but not for the *numbers*.

While consolidating, you'll hit a genuine contradiction: the win-by-2 rule's code and its own comment disagree. That needs a decision, not a refactor — see task 2.

This is the lowest-priority batch. Nothing here is a bug (except task 2's ambiguity), and it's safe to defer.

## Tasks

### 1. Pull the magic numbers into config

Extend `RATING_CONFIG` (or add a sibling `MATCH_RULES`) in `src/types/pong.ts` and replace these:

- [x] ELO divisor `400`, hardcoded twice → one `ELO_RATING_DIVISOR` constant in `eloService.ts`.
- [x] Rating-tier thresholds → `RATING_CONFIG.TIERS`, an ordered array `getRatingTier` now does a table lookup over instead of an if/else chain. Tier names stay English — noted in a comment that H8's tier-badge idea is the eventual UI consumer and should translate them then, rather than guessing now.
- [x] Score bounds and rules → new `MATCH_RULES` in `pong.ts`: `WINNING_SCORE`, `MIN_WIN_MARGIN`, `MAX_LOSER_SCORE_AT_WINNING_SCORE`, `MIN_DEUCE_SCORE`, `MAX_SCORE`.
- [x] Name length → `MATCH_RULES.MIN_PLAYER_NAME_LENGTH` / `MAX_PLAYER_NAME_LENGTH`.
- [x] `MATCH_RULES`'s doc comment records that the database enforces the same rules independently (`matches_no_draw_check` / `matches_valid_result_check` / `players_name_length_check`, in `db/init.sql` and `db/migrations/002_add_constraints.sql`) and that changing one without the other means the API and the database silently disagree.
- [x] Starting ELO — both UI re-hardcodes fixed (one went with H4.6's chart dedup work, done in that batch since the file was already being rewritten; the other fixed directly here).
- [x] `NewMatch.tsx`'s "minimum 5 kamper" now interpolates `RATING_CONFIG.MINIMUM_MATCHES_FOR_RANKING`.

Kept `as const` throughout. `eloService.test.ts` / `validation.test.ts` were left hardcoding expected numbers, as instructed — both still pass unmodified against the new constants, which is itself evidence the values didn't drift in the move.

**Verified the wiring is real:** temporarily set `MINIMUM_MATCHES_FOR_RANKING` to 3 against the dev server and confirmed `/ny-kamp`'s prose changed from "minimum 5" to "minimum 3", then reverted.

### 2. Resolve the win-by-2 contradiction — decision needed

`src/lib/validation.ts` has a comment and an implementation that disagree:

- `:62` says *"winner must win by exactly 2"*
- `:64-66` implements `if (maxScore > 11) return minScore >= 10 && margin >= 2`

So a **20-10 score currently validates**: `maxScore` 20 > 11, `minScore` 10 ≥ 10, margin 10 ≥ 2. Real table tennis deuce games end at exactly +2 (12-10, 13-11, 14-12), which is what the comment describes and what the listed examples at `:63` show.

**Decision (owner sign-off, obtained before implementing): tighten to exactly +2.** 20-10 now fails validation where it used to pass — a deliberate behavior change, not a refactor.

- [x] Tightened the deuce branch to `minScore >= MATCH_RULES.MIN_DEUCE_SCORE && margin === MATCH_RULES.MIN_WIN_MARGIN`.
- [x] Code, comment, README (`## Rules`), the error message, and the CHECK constraint all restate the same rule now.
- [x] Added `db/migrations/003_tighten_deuce_margin.sql`, dropping and re-adding `matches_valid_result_check` (002 left untouched, as instructed — it's already applied). Added VALIDATED per `AGENTS.md`, so it aborts on any existing violation. Ran the pre-flight query against the local database first: zero violating rows — but that's seed data, not production history, and the migration file says so explicitly and tells whoever runs it against a real database to re-check. `db/init.sql` mirrors the tightened constraint for fresh installs; confirmed via `pg_get_constraintdef` that a migrated database's constraint definition is byte-for-byte identical to what `init.sql` now declares.
- [x] `validation.test.ts` updated: the error-message assertion, a new test pinning that a deuce win by more than 2 is rejected (20-10, 15-10, ...), and a new test covering the four boundaries this decision named (11-9 valid, 11-10 invalid, 12-10 valid, 20-10 invalid).

Left the `>= 11` refine and the larger refine's recomputation of max/min score as they were — the doc flagged it as optional cleanup ("keep it or fold it in deliberately"), and folding it in wasn't necessary to land the actual rule change.

**Verified against a live database, not just the type checker:** applied the migration locally, then by hand inserted a 20-10 match (rejected by the CHECK constraint, confirmed via the error text) and a 12-10 match inside a rolled-back transaction (accepted).

### 3. De-duplicate matchService — mostly done by H2

H2 rewrote this file and did the extraction this task called for. Re-verified 2026-08-11:

- [x] The two near-verbatim resolve-or-create blocks are gone. `MatchService.resolveSide` (`matchService.ts:72-96`) is the single helper, called twice from `validateMatchCreation` (`:48,53`) with a `position: 1 | 2` argument. The Norwegian prefixes are now built from that argument (`` `Spiller ${position}` `` at `:75,80,92`) instead of being written out twice.
- [x] `createNewMatchSchema` is gone (H1). `validateUniquePlayerName` now has exactly one production call site, `matchService.ts:83`.
- [x] `isSamePlayer` in `gameUtils.ts` is gone (H1).

What's left, re-verified:

- [x] The same-player rule is still expressed twice — deliberately. `MatchService.isSameSide` and `createMatchInputSchema`'s refine are not equivalent (the doc's own reasoning still holds: `isSameSide` cross-checks a new name against the roster, the schema refine doesn't). Left unmerged; `src/lib/messages.ts` now has a comment on `SAME_PLAYER_MESSAGE` explaining why, so the next person doesn't rediscover the same question.
- [x] `'Spillerne må være forskjellige'` — hoisted in task 4, where the doc itself said it belonged ("Task 4 territory").
- [x] The two score-bound messages, each written twice in `validation.ts` — hoisted to module constants in task 1's commit, since they were part of the same `MATCH_RULES` rewrite.

### 4. Centralize the Norwegian strings

No i18n library, and there shouldn't be one — this is a Norwegian-only internal tool.

- [x] The concrete duplicate from task 3 (`'Spillerne må være forskjellige'`) is now `SAME_PLAYER_MESSAGE` in `src/lib/messages.ts` (a module H4.1 had already started, for `PLAYER_NOT_FOUND`), imported by both `matchService.ts` and `validation.ts`. The rest of `validation.ts`'s ~11 messages were **not** moved — per the doc's own pragmatism instruction, that file is "nearly a message catalog already" and moving strings used in exactly one place elsewhere would only cost readability.
- [x] UI copy: swept `src/pages` and `src/components` for exact-duplicate Norwegian string literals after H4/H5's consolidation had already collapsed most of them. Found one real remaining duplicate — `Overview.tsx` and `Leaderboard.tsx` rendered byte-identical `EmptyState` copy for "no players yet" — hoisted to `NO_PLAYERS_EMPTY_STATE` in `messages.ts`. `Matches.tsx`'s similar-looking "no matches yet" empty state has different title/description text, so it stays inline; not a real duplicate, just a shared action label.
- [x] Norwegian text, English identifiers — kept throughout.

### 5. Fix the README's inaccuracies

- [x] "Bottom navigation" claim reworded to describe the real navigation (header + "Se alle" links). Also true as of H5.3, which added an actual `<nav>` landmark for the first time.
- [x] Reworded both the Features and Rules mentions of "minimum 5 matches" to say ineligible players are still listed (tagged "Mangler kamper"), not excluded.
- [x] Project structure block gained `leaderboard/`, `player-card/`, `player-metrics/` (13 files across three folders, `player-metrics/` being the largest component area in the repo) and `lib/messages.ts`.
- [x] Dropped `FullBleed` from the `layout/` line — H1 deleted it; `links/` stays, since `JokulRouterLink` still exists there.
- [x] **Decision (owner sign-off, obtained before implementing): renamed the README title to "Fremtind kontorpong"**, matching what the UI header has always said, rather than renaming the UI. The Dokku app name and `package.json`'s `name` field are separate infra identifiers and were left untouched — the decision was scoped to the display name, not every place "office-pong" appears.
- [x] Re-checked `README.md`'s win-by-2 line against task 2's decision — already updated in that commit, still correct.

## Out of scope

| Tempting to fix | Owned by |
|---|---|
| Chart/page component dedup, moving inline types to `pong.ts` | H4 |
| Adding a real i18n library | Nobody — out of scope by design for a single-locale internal tool |
| Deleting `getRatingTier` because only tests use it | Kept; see task 1 and H8 |
| Renaming the app | Asked first — see task 5 |

## Verify

```bash
pnpm types:check && pnpm lint && pnpm prettier:check && pnpm vitest run
```

All pass (70 tests when run with `DATABASE_URL` set — the 6 server integration tests run for real rather than being skipped, and they exercise the tightened deuce constraint indirectly via the transaction path).

- [x] **Config is actually wired up:** verified for `MINIMUM_MATCHES_FOR_RANKING` — see task 1. Did **not** separately re-verify `STARTING_ELO` by toggling it and checking the profile chart baseline in a browser (no browser automation available this session); it's referenced correctly by grep (`rg STARTING_ELO src/` shows only the constant's definition and its consumers, no stray re-hardcodes) and covered by `gameUtils.test.ts` / the integration tests, but the visual chart-baseline check specifically was not run.
- [x] **Task 2's boundaries** verified two ways: `validation.test.ts`'s new boundary test (11-9 valid, 11-10 invalid, 12-10 valid, 20-10 invalid) via `pnpm vitest run`, and by hand against the live database (20-10 rejected, 12-10 accepted) — not by hand on the running `/ny-kamp` form in a browser.
- [ ] **Duplicate player name error message on the running form:** not re-verified in a browser after the matchService extraction. The underlying logic wasn't touched by this batch's changes (only the "Spillerne må være forskjellige" *string* moved, not the "Spiller 1:"/"Spiller 2:" prefix logic), and `matchService-validation.test.ts` covers it at the unit level, but nobody watched it render.
- [x] Read `README.md` start to finish against the current state of the app and the codebase (not the running UI in a browser) and confirmed every claim holds.

**Residual:** the duplicate-name error message and the STARTING_ELO chart baseline both need a quick browser check; low risk since both are covered by passing unit/integration tests, but unverified end-to-end.
