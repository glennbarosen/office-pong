# H6 — Tooling, CI & test infrastructure

**Status:** done (branch `h6-tooling-ci`, unmerged) — 3 optional items deliberately skipped, unticked below
**Depends on:** H1 (so CI is green on its first run — `prettier:check` is red on HEAD today)
**Touches:** `.github/workflows/`, `package.json`, `tsconfig.*.json`, `eslint.config.js`, `vitest.config.ts`, `Dockerfile`, `.dockerignore`, `docker-compose.yml`, `src/test/**`
**Est. size:** M

## Why

There is no CI. `.github/` does not exist, so nothing verifies lint, types, formatting, or tests on push — and three of those four would currently fail or hang (`prettier:check` is red, `pnpm test` is watch mode). Meanwhile `tsconfig.app.json` is strictly *weaker* than `tsconfig.node.json`, and turning on one missing flag surfaces a real user-visible bug.

Do this second, right after H1: every batch after it benefits from a guard rail, and the strictness flags will catch mistakes in H2–H5 as they're written.

## Tasks

### 1. Add CI

- [x] Create `.github/workflows/ci.yml` running on push and pull_request: install with pnpm (respect the `packageManager` pin, `package.json:64`), then `lint`, `types:check`, `prettier:check`, and tests.
- [x] Use Node 24 to match the Dockerfile (`Dockerfile:1,13`).
- [x] Cache the pnpm store.
- [x] Don't add a job that needs a database — every existing test is pure logic. If H2's work later wants integration tests, that batch can add a Postgres service container.
- [ ] **Follow-up, found on the first real CI run (2026-08-11).** The workflow passed, but GitHub annotated it: *"Node.js 20 is deprecated. The following actions target Node.js 20 but are being forced to run on Node.js 24: `actions/checkout@v4`, `actions/setup-node@v4`."* Harmless now, breaks when GitHub drops the compatibility shim. Bump both to `@v5`. One-line change, no behavior impact.
- [ ] **H2 landed integration tests, and CI does not run them.** `src/lib/server/__tests__/matches.integration.test.ts` self-skips without `DATABASE_URL`, so CI silently reports 57 passed / 6 skipped and would not catch a data-layer regression. Add a Postgres service container and set `DATABASE_URL` for the test step — this is exactly the case the item above deferred to "that batch", and that batch has now shipped.

**Acceptance:** the workflow passes on a PR from a clean branch. If it doesn't, H1 wasn't finished.

### 2. Make tests CI-runnable

- [x] `pnpm test` is bare `vitest`, i.e. watch mode — it would hang a CI runner forever. Add `"test:run": "vitest run"` and use that in CI. Keep `test` as watch for local use (`AGENTS.md` documents it that way).
- [x] Add coverage: install `@vitest/coverage-v8` and add a `coverage` block to `vitest.config.ts` (there is none). Report on `src/lib/**` and `src/utils/**` — the pure logic — and don't set a threshold gate yet; measure first.
- [x] `vitest.config.ts` has no `include`/`exclude`. It currently picks up `src/lib/__tests__/` by convention; make it explicit.
- [x] Note that `vitest.config.ts` is separate from `vite.config.ts`, so tests run without the TanStack Start and Nitro plugins. That's fine for pure-logic tests but will bite when component tests need the router — merge them or share config if task 6 hits friction.

### 3. Tighten tsconfig

`tsconfig.app.json:18-21` has `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`. Missing flags, in priority order:

- [x] **`noUncheckedIndexedAccess` — this one catches a live bug.** `match.eloChanges[match.winnerId]` is typed `number` but is `undefined` for any row whose `elo_changes` is the schema default `'{}'::jsonb` (`db/init.sql:24`), so `src/pages/Matches.tsx:99-113` renders **`+NaN`**. Enable the flag, then fix the resulting errors properly (a fallback, or filtering those rows) rather than asserting them away.
- [x] `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUncheckedSideEffectImports` — all three are **already enabled in `tsconfig.node.json:12,20,22`**, so the app config is currently laxer than the build-tooling config. Align them.
- [ ] **Skipped.** Consider `exactOptionalPropertyTypes` and `noImplicitOverride`. Both are lower value here; skip if they generate noise.
- [x] `tsconfig.node.json:24` includes only `vite.config.ts`, so `vitest.config.ts`, `eslint.config.js`, `tailwind.config.js`, `postcss.config.js`, and `prettier.config.js` are **never type-checked**. Widen the include.
- [ ] **Skipped** (optional, touches many files — still worth doing). Add path aliases (`@/*` → `src/*`) in `tsconfig.app.json` **and** `vite.config.ts` (Vite needs `resolve.alias` too, or the `vite-tsconfig-paths` plugin). Deep relative imports like `../../types/pong` (`src/lib/server/matches.ts:3`) are the norm today. This one is optional and touches many files — if you do it, make it a separate commit from everything else in this batch.

Expect `noUncheckedIndexedAccess` to produce errors across `src/utils/gameUtils.ts` and the chart components. That's the point.

### 4. Strengthen ESLint

`eslint.config.js` is 33 lines and currently reports zero problems, which says more about its coverage than about the code.

- [x] `ignores: ['dist']` only (`:5`). Add `.output` (the Nitro build dir) and `src/routeTree.gen.ts` (generated, `@ts-nocheck`, full of `as any`).
- [x] Only `tseslint.configs.recommended` — non-type-aware. Upgrade to `recommendedTypeChecked` for rules that need type information (unsafe `any` flow, floating promises — relevant given the async server functions).
- [x] Add `eslint-plugin-jsx-a11y`. This directly supports H5, and catches regressions afterward.
- [x] `globals: globals.browser` only (`:9`), yet `src/lib/server/db.ts:4` uses `process.env`. Add Node globals for `src/lib/server/**` and the config files.
- [x] `ecmaVersion: 2020` (`:8`) vs a TS target of ES2022. Bump it.
- [x] Add `--max-warnings=0` to the `lint` script so warnings can't accumulate silently (`react-refresh/only-export-components` is configured as a warning at `:29`).
- [ ] **Partly done:** `reportUnusedDisableDirectives` is on; `noInlineConfig` left `false` because the harness and the recharts tooltips need targeted suppressions. Consider `noInlineConfig: true` (currently `false` at `:11`) or at least require descriptions on suppressions — there are two inline suppressions in the codebase today.
- [x] Add the vitest ESLint plugin for the test files if it's cheap.

### 5. Node version and Docker

- [x] There is **no** `engines` field and no `.nvmrc`/`.node-version`. Node 24 is implied only by `Dockerfile:1,13` and `README.md:90`. Add both so local mismatches surface early.
- [x] **No `.dockerignore` exists.** `Dockerfile:9` is `COPY . .`, so the build context includes local `node_modules` and `.git` — slow builds, and a real risk of shipping host-built native modules. Add one covering `node_modules`, `.git`, `.output`, `dist`, `.env`, and the docs.
- [x] `Dockerfile:7` does `npm install -g pnpm`, bypassing the `packageManager` version pin. Use `corepack enable && corepack prepare --activate` instead.
- [x] Add `ENV NODE_ENV=production` to the runtime stage.
- [x] Run as a non-root user (`node:24-alpine` ships a `node` user).
- [x] Add a `HEALTHCHECK`. `README.md:68` already describes healthchecks as part of the deployment story; the image doesn't have one. Needs a trivial health endpoint if none exists.
- [x] `docker-compose.yml` has no healthcheck on the Postgres service and pins only `postgres:16-alpine`. Add a `pg_isready` healthcheck — this is the kind of thing that makes `pnpm db:up && pnpm dev` flaky on a cold start.

### 6. Build the missing test harness

`AGENTS.md` notes no test-render helper exists for mounting components with router/query providers, and asks whoever adds component tests to write one. Current state: **30 tests in 3 files**, all under `src/lib/__tests__/`, all pure logic.

- [x] Write `src/test/renderWithProviders.tsx` wrapping Testing Library's `render` with a `QueryClientProvider` (a fresh client per test, `retry: false`) and a test router. `@testing-library/react` and `user-event` are already installed — H1 was told to keep them for this.
- [x] `src/test/setup.ts` is a single `import '@testing-library/jest-dom'` line; extend it if the harness needs global cleanup.
- [x] Then add tests for the **untested pure logic first**, which is cheap and high value: all of `src/utils/gameUtils.ts` has zero coverage — `createLeaderboardEntries` (the eligible-first sort at `:13-18` is real logic), `getRankIcon`, `createPlayerMap`, `formatDate` (including the `includeTime` branch at `:59`), `parseInteger`.
- [x] One or two smoke tests using the new harness, to prove it works. Don't attempt broad component coverage in this batch.
- [x] **Do not add Playwright or any E2E framework** — `AGENTS.md` is explicit about this.

## Out of scope

| Tempting to fix | Owned by |
|---|---|
| The `+NaN` render itself, beyond making the type error go away | Fix it here — you're the one who surfaced it. But leave `Matches.tsx`'s structural dedup to H4 |
| Integration tests against a real database | H2, if it wants them |
| Actually fixing a11y violations that `jsx-a11y` reports | H5. Add the plugin here; if it fails the build immediately, downgrade its rules to warnings and let H5 clear them |
| Upgrading React 18 → 19, Tailwind 3 → 4, or the `nitro` beta pin (`package.json:28`) | Nobody yet — deliberate choices (the Jøkul pin may block React 19). Note versions in a follow-up if you think they're urgent |

## Verify

```bash
pnpm install
pnpm lint            # with the new plugins and --max-warnings=0
pnpm types:check     # expect to have fixed real errors from noUncheckedIndexedAccess
pnpm prettier:check
pnpm test:run
pnpm test:run --coverage
pnpm build
```

- **The `+NaN` bug:** insert a match row with the default empty `elo_changes` and confirm `/kamper` renders something sensible rather than `+NaN`:
  ```sql
  INSERT INTO matches (player1_id, player2_id, winner_id, loser_id, player1_score, player2_score)
  SELECT p1.id, p2.id, p1.id, p2.id, 11, 5
  FROM (SELECT id FROM players LIMIT 1) p1, (SELECT id FROM players OFFSET 1 LIMIT 1) p2;
  ```
- **CI actually runs:** push the branch and open a PR. Confirm the workflow triggers and passes. Then push a deliberate lint error and confirm it fails — a workflow that never fails isn't a guard.
- **Docker build:** `docker build -t office-pong .` and confirm the context is smaller than before (compare the "Sending build context" size). Run the image and hit the healthcheck.
- **Compose healthcheck:** `pnpm db:down && pnpm db:up && pnpm dev` immediately, with no manual wait. The app should connect on the first try.
- Confirm `.output` and `src/routeTree.gen.ts` are no longer linted: `pnpm lint` after a `pnpm build` should not slow to a crawl or report generated-file noise.
