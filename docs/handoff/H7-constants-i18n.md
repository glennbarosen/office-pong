# H7 — Constants & Norwegian string centralization

**Status:** not started
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

- [ ] ELO divisor `400`, hardcoded twice — `src/lib/eloService.ts:22,23`.
- [ ] Rating-tier thresholds `1800` / `1600` / `1400` / `1200` — `src/lib/eloService.ts:61-64`. Note the tier names are English ("Grandmaster", "Master", …) while the UI is Norwegian; `getRatingTier` is currently only referenced by tests, so decide whether it's headed for UI (H8 has a tier-badge idea) and translate accordingly.
- [ ] Score bounds and rules in `src/lib/validation.ts`: max `99` (`:29,34`), winning score `11` (`:40,57,64`), margin `2` (`:51`), the deuce thresholds `9` and `10` (`:58,65`).
- [ ] Name length `2` and `50` (`src/lib/validation.ts:85-86`).
- [ ] **The same numbers now also live in SQL.** H2 encoded the score rules as a CHECK constraint — `db/migrations/002_add_constraints.sql:70-79` (`matches_valid_score_check`) and the mirrored copy in `db/init.sql` — and the name bounds as `length(trim(name)) BETWEEN 2 AND 50` (`002_add_constraints.sql:102`). A TypeScript constants module cannot reach these. Don't try; just note in a comment beside `MATCH_RULES` that the database enforces the same rules independently and both must change together.
- [ ] Starting ELO `1200` re-hardcoded in the UI — `src/components/player-metrics/usePlayerMetricsData.ts:75` and `PlayerMetrics.tsx:42`. (H4 also flags these; whoever gets there first wins.)
- [ ] `src/pages/NewMatch.tsx:77` hardcodes the prose "minimum 5 kamper" instead of interpolating `RATING_CONFIG.MINIMUM_MATCHES_FOR_RANKING`. This is the exact failure mode this batch prevents: change the config and the UI lies.

Keep `as const`. The existing tests (`src/lib/__tests__/eloService.test.ts`, `validation.test.ts`) hardcode expected values — that's fine and arguably correct for tests, so don't rewrite them to use the config, or they'd stop catching config regressions.

### 2. Resolve the win-by-2 contradiction — decision needed

`src/lib/validation.ts` has a comment and an implementation that disagree:

- `:62` says *"winner must win by exactly 2"*
- `:64-66` implements `if (maxScore > 11) return minScore >= 10 && margin >= 2`

So a **20-10 score currently validates**: `maxScore` 20 > 11, `minScore` 10 ≥ 10, margin 10 ≥ 2. Real table tennis deuce games end at exactly +2 (12-10, 13-11, 14-12), which is what the comment describes and what the listed examples at `:63` show.

`README.md:25` says "must win by at least 2 points", which matches the loose code. So two of the three sources agree with each other and the third is the most specific.

**There is now a fourth source: the database.** H2 shipped `matches_valid_score_check` (`db/migrations/002_add_constraints.sql:70-79`, mirrored in `db/init.sql`), which encodes the *loose* rule — `GREATEST >= 11 AND GREATEST - LEAST >= 2 AND (GREATEST = 11 AND LEAST <= 9 OR GREATEST > 11 AND LEAST >= 10)`. That was deliberate: H2's brief was to encode current code behavior, not to decide this question. It does mean the loose reading is now enforced in production data, which raises the cost of tightening.

- [ ] **Confirm the intended rule before changing anything.** If deuce should be exactly +2, tighten `:65` to `margin === 2 && minScore >= 10` — but that's a behavior change that will reject scores people may have been entering, so it needs a human's sign-off, not a refactor decision.
- [ ] Whatever you decide, make the code, the comment, `README.md:25`, the error message at `:72-73`, **and the CHECK constraint** all say the same thing.
- [ ] If you tighten it, add a new `db/migrations/NNN_*.sql` that drops and re-adds `matches_valid_score_check` — don't edit `002_*.sql` in place, it has already been applied. Per `AGENTS.md` the new constraint is added validated, so it will **abort** if any existing row violates it. Query first: `SELECT * FROM matches WHERE GREATEST(player1_score, player2_score) > 11 AND GREATEST(player1_score, player2_score) - LEAST(player1_score, player2_score) <> 2;` Those rows are real match history — decide what happens to them before you write the migration.
- [ ] Update `src/lib/__tests__/validation.test.ts` to cover the boundary explicitly — 12-10 valid, 20-10 whichever it now is, 11-10 invalid. H2 already expanded this file, so check what's covered before adding.

Also while you're here: the `>= 11` refine at `:40-43` is fully subsumed by the larger refine at `:44-76` (which returns `false` for any `maxScore < 11` at `:69`). Its only value is a more specific error message. Keep it or fold it in deliberately, but note that the max/min score math is recomputed across both (`:40`, `:46-47`).

### 3. De-duplicate matchService — mostly done by H2

H2 rewrote this file and did the extraction this task called for. Re-verified 2026-08-11:

- [x] The two near-verbatim resolve-or-create blocks are gone. `MatchService.resolveSide` (`matchService.ts:72-96`) is the single helper, called twice from `validateMatchCreation` (`:48,53`) with a `position: 1 | 2` argument. The Norwegian prefixes are now built from that argument (`` `Spiller ${position}` `` at `:75,80,92`) instead of being written out twice.
- [x] `createNewMatchSchema` is gone (H1). `validateUniquePlayerName` now has exactly one production call site, `matchService.ts:83`.
- [x] `isSamePlayer` in `gameUtils.ts` is gone (H1).

What's left is smaller and genuinely belongs to this batch:

- [ ] The same-player rule is still expressed twice, in two different shapes: `MatchService.isSameSide` (`matchService.ts:98-113`, comparing `PlayerRef`s and resolving a name against the roster) and the final refine on `createMatchInputSchema` (`validation.ts:116-127`, comparing ids or names but *not* cross-checking a new name against an existing player). They can disagree: a client posting `{type:'new', name:'Ada'}` against existing player Ada passes the schema and is caught only by the uniqueness check. That's fine defensively — just don't "unify" them without noticing they aren't equivalent.
- [ ] Both spellings of the message `'Spillerne må være forskjellige'` are literals (`matchService.ts:60`, `validation.ts:126`). Task 4 territory — this is the clearest example of a message worth hoisting.
- [ ] `'Poengsum kan ikke være negative'` and `'Poengsum kan ikke være over 99'` are each written twice in `validation.ts` (`:28,33` and `:29,34`), once per score field. Same treatment.

### 4. Centralize the Norwegian strings

No i18n library, and there shouldn't be one — this is a Norwegian-only internal tool. A constants module is the right size.

- [ ] Start with **error messages**, which are duplicated across `src/lib/matchService.ts` (6 `throw new Error` sites, `:45,60,75,80,84,92`) and `src/lib/validation.ts` (~11 distinct messages, `:10,28,29,37,41,73,84,85,86,89,126`) and are the strings most likely to drift. `validation.ts`'s cluster is nearly a message catalog already. The concrete duplicates are listed in task 3.
- [ ] UI copy is inline across ~10 files (`src/pages/Overview.tsx:46,50,63,84,129,130`; `NewMatch.tsx:74,76-79,124,127`; `PlayerCard.tsx:35,43,51,60,68,69,79`; `Profile.tsx:24,25,45,50-59`; `LoadingSpinner.tsx:6`). **Be pragmatic here** — hoisting every JSX string into a constants file makes components harder to read for no real benefit in a single-locale app. Prioritize strings that appear more than once or that encode a rule (like the "minimum 5 kamper" case in task 1).
- [ ] Keep Norwegian text, English identifiers, per `AGENTS.md`.

### 5. Fix the README's inaccuracies

- [ ] **`README.md:15` claims "bottom navigation".** There is none — `rg '<nav'` over `src/` is still empty. Navigation is a header (`src/components/header/Header.tsx`), a "← Hjem" link (`src/routes/__root.tsx:46`), and "Se alle" buttons (`src/pages/Overview.tsx:78,122`). Either fix the README or file it as a feature; don't leave it describing something that doesn't exist.
- [ ] `README.md:16` says the leaderboard requires a minimum of 5 matches, implying exclusion. Ineligible players *are* listed — sorted last with a "Mangler kamper" tag (`src/utils/gameUtils.ts:11-18`, `src/pages/Overview.tsx:60-64`). Reword.
- [ ] The project structure block, now at `README.md:132-162`, still omits the `player-card/` and `player-metrics/` component folders — 11 files, the largest component area in the repo. H2 refreshed parts of this block (it gained `lib/server/` and `test/`) but not the components subtree at `:136-142`.
- [ ] **New, introduced by H1:** that same block lists `layout/ # Layout components (Container, FullBleed)` at `:139` and a `links/` folder at `:140`. H1 deleted `FullBleed.tsx`, `HeaderLink.tsx`, `JokulRouterNavLink.tsx` and `header-link.scss`. `links/` still exists (`JokulRouterLink`), but `FullBleed` does not. Drop it.
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
