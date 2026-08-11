# H1 — Dead code & dependency cleanup

**Status:** done (branch `h1-dead-code`)
**Depends on:** nothing — **do this first**
**Touches:** `src/components/**`, `src/lib/validation.ts`, `src/utils/**`, `src/hooks/usePlayers.ts`, `src/lib/server/players.ts`, `package.json`, `tailwind.config.js`
**Est. size:** S

## Why

Two migrations (TanStack Router SPA → TanStack Start, Supabase → self-hosted Postgres) left residue: a 0-byte file that's still barrel-exported, four components nothing renders, ~150 lines of superseded Zod schemas, and a dependency with zero imports. Every other handoff in this queue describes files this batch deletes, so doing it first shrinks the surface everyone else has to reason about.

Nothing here should change behavior. If a deletion changes what the app does, stop — that means the thing wasn't actually dead.

## Tasks

### Delete unused components

- [x] `src/components/links/JokulRouterNavLink.tsx` — **0 bytes**, still exported at `src/components/index.ts:7`.
- [x] `src/components/common/RankDisplay.tsx` — exported at `index.ts:14`, rendered nowhere.
- [x] `src/components/layout/FullBleed.tsx` — exported at `index.ts:4`, rendered nowhere.
- [x] `src/components/links/HeaderLink.tsx` + `src/components/links/header-link.scss` — exported at `index.ts:5`, rendered nowhere. (Note: `src/components/header/Header.tsx` is a *different* component and is used. Don't delete that.)
- [x] Prune the corresponding `export * from` lines in `src/components/index.ts`.

**Acceptance:** `pnpm build` succeeds and `rg 'RankDisplay|FullBleed|HeaderLink|JokulRouterNavLink' src/` returns nothing.

### Delete superseded validation schemas

`src/lib/validation.ts` carries two form-level schemas that no app code calls — `NewMatch.tsx` validates through `MatchService.processMatchCreation` instead.

- [x] Delete `createNewMatchSchema` (`src/lib/validation.ts:85`).
- [x] Delete `newMatchSchema` (`:176`) — already marked `@deprecated` at `:174`, and a near-verbatim copy of `createNewMatchSchema` minus two refines.
- [x] Delete `NewMatchFormData` (`:236`), whose only purpose is `z.infer` of the above.

That's ~150 lines. **Keep** `validateUniquePlayerName`, `matchScoreSchema`, and `playerNameSchema` — all three are live, tested, and H2 wires them into the server boundary.

**Acceptance:** `src/lib/__tests__/validation.test.ts` still passes (it only exercises `matchScoreSchema` and `playerNameSchema`).

### Delete unused utility exports

- [x] `isSamePlayer` (`src/utils/gameUtils.ts:81`) — the same-player check is done inline at `src/lib/matchService.ts:108`.
- [x] `triggerSimpleConfetti` (`src/utils/confetti.ts:167`) and `triggerConfettiCannon` (`:178`) — the only live export is `triggerMatchSuccessConfetti` (`:9`), called from `src/pages/NewMatch.tsx:8,65`. Keep that one.

### Delete the unused player-update path

- [x] `useUpdatePlayer` (`src/hooks/usePlayers.ts:23`) — zero call sites.
- [x] `updatePlayer` server fn (`src/lib/server/players.ts:58-113`) — its only caller was the hook above. Also drop it from the import at `src/hooks/usePlayers.ts:3`.

This incidentally removes a latent bug, which is why H2 doesn't have to fix it: the dynamic `SET` builder at `players.ts:96` emits invalid SQL (`UPDATE players SET  WHERE id = $1`) when `updates` is empty, and `:101` reads `result.rows[0]` with no `rowCount` check, so a nonexistent id throws a `TypeError` rather than returning a useful error.

### Clean up dead props

- [x] `src/components/common/PlayerLink.tsx:7-8` — `className` and `variant` are declared but never destructured at `:11`. Remove both from the interface. Leave the `@ts-expect-error` at `:17` alone; H5 owns it.
- [x] `src/components/common/DateDisplay.tsx:5` — `includeTime` is declared but never destructured at `:9`, and no call site passes it. **Note:** `formatDate` in `src/utils/gameUtils.ts:51,59` *does* implement an `includeTime` option, so this is an unfinished passthrough rather than pure cruft. Either wire it up (`formatDate(dateString, { includeTime })`) or delete the prop — deleting is fine, and `formatDate`'s option stays useful for H4.
- [x] While in `DateDisplay.tsx`, collapse the pointless div-in-div at `:11-13` into a single element.

### Dependencies

- [x] Remove `date-fns` — zero imports anywhere in `src/` or the configs. Date formatting is hand-rolled in `src/utils/gameUtils.ts:51-68`.
- [x] Remove `@vitest/ui` — installed but no script invokes `--ui`.
- [x] **Keep** `@testing-library/react` and `@testing-library/user-event`. They look unused today (no component tests exist), but H6 adds the render harness that needs them. Deleting them just means H6 re-installs them.
- [x] `pnpm install` to refresh the lockfile.

### Config staleness

- [x] `tailwind.config.js:4` — drop the `./index.html` glob. That file doesn't exist; SSR renders the document in `src/routes/__root.tsx:60`. Keep the `./src/**/*` glob.

### Formatting

- [x] Run `pnpm prettier`. **12 files are unformatted on HEAD**, so `pnpm prettier:check` is currently red: all 7 non-index files in `src/components/player-metrics/`, plus `src/lib/validation.ts`, `src/lib/eloService.ts`, `src/lib/server/matches.ts`, `src/utils/confetti.ts`, `src/lib/__tests__/validation.test.ts`. Mostly trailing whitespace (e.g. `validation.ts:39,44,51,58`).

Do this **last**, as its own commit — a whole-file reformat mixed into deletions makes the diff unreadable. H6 depends on `prettier:check` being green so CI passes on its first run.

## Out of scope

| Tempting to fix | Owned by |
|---|---|
| `MatchWithPlayers` and `HeadToHeadRecord` (`src/types/pong.ts:33,40`) — unused today | **Keep them.** H4 wires up the first, H8 the second |
| `EloService.getRatingTier` (`src/lib/eloService.ts:60`) — only referenced by tests | **Keep it.** H7 moves its hardcoded tier thresholds into config; H8's tier-badge idea may use it |
| Row-mapping duplication in `src/lib/server/` | H2 |
| The `@ts-expect-error` at `PlayerLink.tsx:17` | H5 |
| Duplicated player1/player2 blocks in `matchService.ts:43-105` | H7 |
| Anything in `eslint.config.js` / `tsconfig.*.json` | H6 |

## Verify

```bash
pnpm install
pnpm types:check    # noUnusedLocals is on, so this catches most collateral damage
pnpm lint
pnpm prettier:check # should be green for the first time
pnpm vitest run     # 30 tests in 3 files, all should still pass
pnpm build
```

Then click through the app — no behavior should have changed:

```bash
pnpm db:up && pnpm dev
```

- `/` (Overview), `/ledertavle`, `/kamper`, `/ny-kamp`, and a `/profil/$id` all render.
- Register a match on `/ny-kamp` with a brand-new player name and confirm the confetti still fires (you deleted two of the three confetti exports — `triggerMatchSuccessConfetti` is the one that must survive).
- Toggle the theme in the header.
