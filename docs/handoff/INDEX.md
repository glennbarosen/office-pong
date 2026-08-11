# Improvement handoff queue

A repo-wide audit (2026-08-10, at commit `1c44639`) turned up ~60 concrete issues: three genuine bugs, a hardening gap in the data layer, ~350 lines of dead code, no CI at all, and near-zero accessibility affordances.

Rather than one unreviewable mega-diff, the work is split into batches below. **Each `H*.md` is self-contained** — a fresh session should be able to execute it from that file plus `AGENTS.md`, without re-reading the whole repo.

## Queue

| # | Batch | Status | Depends on | Size |
|---|-------|--------|------------|------|
| H1 | [Dead code & dependency cleanup](H1-dead-code.md) | **done, unmerged** | — | S |
| H6 | [Tooling, CI & test infrastructure](H6-tooling-ci.md) | **done, unmerged** | H1 | M |
| H2 | [Data layer correctness & DB hardening](H2-data-layer.md) | **done, unmerged** | H1 | L |
| H3 | [Query client & SSR correctness](H3-query-ssr.md) | not started | H2 | M |
| H4 | [Page & component dedup, shared types](H4-pages-components.md) | not started | H1, H3 | L |
| H5 | [Accessibility & UX polish](H5-accessibility.md) | not started | H4 | M |
| H7 | [Constants & Norwegian string centralization](H7-constants-i18n.md) | not started | H1 | M |
| H8 | [Feature ideas](H8-feature-ideas.md) | n/a | — | — |

**Recommended order:** H1 → H6 → H2 → H3 → H4 → H5. H1 goes first because every other batch describes files it deletes. H6 goes second so CI guards everything after it. H7 and H8 are independent — pick them up anytime.

Batches are grouped by *file locality*, and each doc lists a `Touches:` glob set. Those sets are near-disjoint, so two batches can proceed on parallel branches without colliding. The exceptions are noted in the docs themselves (H4/H5 both edit JSX; H2/H3 both care about server-fn signatures).

Update the Status column as you go, and tick the checklists inside each doc. That's the handoff state — there's nothing tracked outside these files.

**Where this file lives.** These docs belong on `main`, so that every branch and
every new session sees them — if the queue only exists on the branch doing the
work, nobody else can read it. `AGENTS.md` links here, and `AGENTS.md` is loaded
into every session, which is what makes the queue discoverable at all.

They are **not on `main` yet.** They sit on branch `handoff-queue` (docs +
the `AGENTS.md` pointer, no code), which has been merged into `h2-data-layer`
so the tip of the work stack carries them. Merge `handoff-queue` into `main`
first, ahead of the batch branches; then a batch's own status edit rides in
that batch's PR.

**Branch state (2026-08-11).** H1, H6 and H2 are implemented but **not merged
and not pushed** — they sit on local branches `h1-dead-code`, `h6-tooling-ci`
and `h2-data-layer`, stacked in that order off `main`. Until they merge, `main`
does not contain any of the work described as done below. Merge in queue order;
each branch expects the previous one.

**Starting H3?** Branch from `h2-data-layer` — it is the tip of the stack and
H3 depends on H2. Nothing is pushed, so there are no PRs open yet.

**Docs re-verified against the stack (2026-08-11, at `d634f08`).** The audit was
written against `main` (`1c44639`); H1, H6 and H2 have since rewritten
`validation.ts`, `matchService.ts`, both hooks, `Matches.tsx` and every file in
`player-metrics/`. Every line reference in H3, H4, H5 and H7 has been re-checked
and corrected against the tip of the stack, so **read those docs against
`h2-data-layer`, not `main`** — on `main` the numbers will not line up. What
changed materially:

- **H7 task 3 is now mostly done** — H2's rewrite performed the `matchService`
  extraction the task described. What remains is rewritten in place.
- **H7 task 2 gained a fourth source of truth.** H2 shipped a
  `matches_valid_score_check` CHECK constraint encoding the *loose* win-by-2
  reading, so tightening the rule now needs a migration against real match
  history, not just a code edit.
- **H3 gained an item:** `useAddPlayer` and the `addPlayer` server fn have no
  callers left — H2 removed the last one. That's dead code H1 could not have
  seen.
- **H7 task 5 gained an item:** H1 deleted `FullBleed.tsx`, which the README's
  project-structure block still lists.

The three real bugs and every "still open" claim below were re-checked and hold.

## The three real bugs

If you only fix three things, fix these. Each is owned by the batch in brackets.

1. **STILL OPEN. The `QueryClient` is a module-level singleton** (`src/router.tsx:5`) handed to every `getRouter()` call. On the server that is one cache shared across all requests and all users. [H3]
2. **FIXED on `h2-data-layer`.** Persisted ELO was computed from client-supplied data. `src/lib/server/matches.ts:39` calls `EloService.calculateEloChanges(data.winnerData, data.loserData)` on `Player` objects the browser posted, then writes the result into `players.elo_rating`. A stale client cache silently corrupts ratings. [H2]
3. **FIXED on `h2-data-layer`.** Players were created outside the match transaction (`src/lib/matchService.ts:58,91` call `addPlayer` before `addMatchWithPlayerUpdates`), so a failing match insert leaves orphaned players behind. [H2]

Two more that are user-visible but narrower: `src/pages/Profile.tsx:20` flashes "Spiller ikke funnet" before data arrives [H4, **still open**], and matches whose `elo_changes` is the default `'{}'` rendered `+NaN` at `src/pages/Matches.tsx:99-113` [**fixed on `h6-tooling-ci`**; `noUncheckedIndexedAccess` surfaced it, and `src/pages/__tests__/Matches.test.tsx` pins it].

## Conventions for every session

- **Read `AGENTS.md` first.** It is the single source of truth for stack, architecture, and commands.
- `createServerFn(...).inputValidator()` — **not** `.validator()`. The latter is an older API name common in training data and fails silently.
- `src/routeTree.gen.ts` is generated. Never hand-edit it.
- Components reach data only through the hooks in `src/hooks/` — never call a server function or `fetch` from a component.
- Norwegian UI text, English code identifiers.
- Prefer Jøkul components over raw HTML; Tailwind for layout, SCSS only for genuinely complex styling.
- Match rules live in `validation.ts` / `eloService.ts` / `matchService.ts`. Read those before touching match or ELO logic — don't reimplement the rules inline.

### Before you finish

```bash
pnpm prettier          # 12 files are unformatted on HEAD; see H1
pnpm lint
pnpm types:check
pnpm vitest run        # `pnpm test` is watch mode — H6 adds a `test:run` script
```

One branch and one PR per handoff. Don't fold two batches into one PR — the point of the split is reviewable diffs.

### Scope discipline

Each doc has an **Out of scope** section naming which other batch owns the things you'll be tempted to fix. Respect it. If you find something genuinely new, add it to the relevant doc's checklist rather than fixing it inline — that keeps the queue accurate for whoever comes next.
