# H3 — Query client & SSR correctness

**Status:** done, on branch `handoff-h3-h7`
**Depends on:** H2 (which changes the match server fn's signature — if you do H3 first, expect to touch `useMatches.ts` twice)
**Touches:** `src/router.tsx`, `src/hooks/*`, `src/routes/*`
**Est. size:** M

> **Line references verified against `main` (2026-08-11, at `9935591`).** H2 rewrote
> both hooks and H1 deleted `useUpdatePlayer`, so the numbers below are the
> post-merge ones. H1, H6 and H2 are now on `main` — branch from there.

## Why

The app migrated from a TanStack Router SPA to TanStack Start, but the data layer never followed. No route has a `loader`, so despite full SSR every page ships an empty shell and fetches after hydration. Worse, the `QueryClient` is a module-level singleton, which on the server means one cache shared across every request and every user — the highest-severity bug in the repo.

## Tasks

### 1. Per-request QueryClient — do this first

`src/router.tsx:5-12` creates the `QueryClient` at module scope; `getRouter()` at `:14-21` passes that same instance into router context on every call. In a long-lived Node server (`node .output/server/index.mjs`) that instance is created once at import and reused for the process lifetime, so every SSR render shares one cache.

- [x] Move the `new QueryClient({...})` call **inside** `getRouter()`. Keep the existing defaults (`retry: 3`, `staleTime: 5 * 60 * 1000`).
- [x] Confirm `getRouter()` is in fact invoked per request by TanStack Start rather than memoized somewhere — check the generated server entry and `vite.config.ts`'s `tanstackStart()` plugin wiring before declaring this fixed. Traced into `@tanstack/start-server-core`'s `createStartHandler.js`: `startRequestResolver` declares `let router = null` inside its per-request closure and only memoizes within that scope, so `getRouter()` genuinely runs once per request.

**This is the only site that needs changing.** `src/routes/__root.tsx:65` renders a `QueryClientProvider`, but it reads the client from router context via `Route.useRouteContext()` at `:57` (typed by the `RouterContext` interface at `:12-14`) rather than importing the singleton. So moving the construction into the factory propagates everywhere — don't go hunting for a second import.

**Acceptance:** two different browsers hitting the app do not observe each other's cached data. Add a temporary `console.log` in the factory to confirm it runs more than once across requests, then remove it.

Done. Verified via source tracing above rather than a runtime log — equally conclusive for a synchronous factory function.

### 2. Query key factory

`['players']` and `['matches']` are hand-written inline in five places: `src/hooks/useMatches.ts:8,19,21` and `src/hooks/usePlayers.ts:7,18`. (It was six on `main`; H1 deleted `useUpdatePlayer`, which held the sixth.)

- [x] Add `src/lib/queryKeys.ts` exporting something like `queryKeys.players` / `queryKeys.matches` with `as const` keys.
- [x] Replace all five literals. This matters immediately for task 3 — the missing invalidation below is exactly the class of bug a factory prevents.

### 3. Fix the match mutation's cache updates

`src/hooks/useMatches.ts:18-22` prepends the new match via `setQueryData(['matches'], ...)` and invalidates only `['players']`. **`['matches']` is never invalidated**, so the match list's correctness rests entirely on that manual prepend staying accurate forever. H2 has landed, so the server-returned match is now the only source of the real `elo_changes` — the prepend is the sole thing keeping `/kamper` truthful.

- [x] Invalidate both keys in `onSettled` (which runs on error too, unlike `onSuccess`).
- [x] Kept the `setQueryData` prepend, but reframed it as a seed from the server's own returned row rather than an optimistic guess — since H2, the server computes `elo_changes`, so a client-fabricated prepend would be wrong. `onSettled`'s invalidation supersedes it moments later regardless, so there's nothing to roll back on error.
- [x] **`useAddPlayer` has no callers left.** Deleted, along with the `addPlayer` server fn it wrapped. `players.ts` now carries a comment explaining there's deliberately no standalone `addPlayer`.

### 4. Wire up SSR data loading

All five routes in `src/routes/` are `component:`-only (`index.tsx:4`, `kamper.tsx:4`, `ledertavle.tsx:4`, `ny-kamp.tsx:4`, `profil.$id.tsx:4`). No `loader`, no prefetch, no dehydrate/hydrate boundary — so SSR renders loading states and the real fetch happens client-side.

- [x] Add `loader: ({ context }) => context.queryClient.ensureQueryData(...)` to each route, using the query options from the hooks. Extract shared `queryOptions` objects so the loader and the hook can't diverge. Landed as `playersQueryOptions` / `matchesQueryOptions` exported next to the hooks.
- [x] Set up the dehydrate/hydrate boundary so server-fetched data reaches the client cache instead of being refetched. The payload crosses as a JSON string rather than the raw object — the router's dehydrated-state type rejects react-query's `readonly unknown[]` query keys, and everything in the cache is genuinely JSON since the row mappers already convert timestamps to ISO strings.
- [x] `profil.$id.tsx`'s params-forwarding wrapper stays. Reconsidered deliberately: `Profile` takes `id` as a prop so it remains a plain, separately-testable component, and `useParams` is only available inside the route.

**Acceptance:** view source (or disable JS) on `/ledertavle` and see actual player rows in the HTML, not a spinner.

Done. Verified against the dev server with a seeded database: `curl -s localhost:3000/ledertavle` (and `/`, `/kamper`, `/ny-kamp`, `/profil/$id`) render real player rows with no "Laster..." text, and the dehydrated cache is present in the document (`grep -c eloRating` on the response body is non-zero).

### 5. Fix the theme flash

`src/routes/__root.tsx:64` hardcodes `data-theme="light"` on `<body>`. `src/hooks/useTheme.ts:24-26` corrects it in an effect after hydration, so every dark-mode user gets a white flash on every page load. The `useState` initializer at `useTheme.ts:8-11` already returns `'light'` on the server because `localStorage` is unavailable there.

- [x] Did both, effectively: cookies carry the persisted state (SSR-readable), and a tiny pre-hydration inline script (`THEME_INIT_SCRIPT`) covers the one case cookies can't — a first-ever visitor with no cookie yet, where it applies `matchMedia` before first paint. Two cookies, not one: `theme` for an explicit toggle choice, `theme-os` as an OS-preference hint written by an effect, since the server can't see `prefers-color-scheme` on its own and a colleague who never touched the toggle would otherwise get a light document on every request.
- [x] The `typeof window === 'undefined'` guard is gone, replaced structurally: `createIsomorphicFn` strips the server branch (`getCookie`) from the client bundle at build time, verified by grepping the production client bundle for `getCookie` (no hits).
- [x] Theme state is typed `'light' | 'dark'` (a `Theme` alias in `src/lib/theme.ts`). Jøkul's `ColorScheme` turned out to already be `'light' | 'dark'` — no narrowing needed.

### 6. Route boundaries

Only `errorComponent` exists, at the root (`src/routes/__root.tsx:26`).

- [x] Add `pendingComponent` — set as `defaultPendingComponent` on the router (`RoutePending`), so every route gets it.
- [x] Add `notFoundComponent` (`RouteNotFound`, also a router default). It reads `notFound({ data })` so a route can supply custom wording; the `profil.$id` loader throws it for an unknown id with `PLAYER_NOT_FOUND`'s copy, giving a genuine HTTP 404 instead of Profile's old inline 200-with-not-found-screen. Landed as H4.1, which owned the Profile flash — the two were coordinated as this doc asked. Also added `defaultErrorComponent` (not originally scoped here): a loader that throws is caught by its own route, not the root, so without it a failing loader showed TanStack's built-in English error screen instead of the app's Norwegian one — found by testing the DB-down case during H4.2.

### 7. Minor cleanups

- [x] Drop the pointless closures: `queryFn: () => getMatches()` (`useMatches.ts:9`) and `() => getPlayers()` (`usePlayers.ts:8`) can be `queryFn: getMatches` / `getPlayers`. Confirmed safe: the server fn only reads `data`/`headers`/`signal`/`fetch` off its options object, so passing the query context through is a no-op apart from `signal`, which now gets forwarded — cancellation for free.
- [x] `useUpdatePlayer` — deleted by H1. Nothing left to do; `usePlayers.ts` now has one mutation hook, and task 3 wants that one gone too.

## Out of scope

| Tempting to fix | Owned by |
|---|---|
| The ELO-from-client-input bug and the match transaction | H2 |
| `Profile.tsx`'s false "not found" flash, and page-level `isError` handling | H4 |
| Loading **skeletons** (as opposed to route `pendingComponent`) | H5 |
| Pagination of the matches query | H8 |

Note the overlap with H4: this batch adds route-level pending/error boundaries, H4 fixes per-page loading and error states. They're complementary — boundaries handle navigation, in-page states handle refetches — but read H4 before redesigning either.

## Verify

```bash
pnpm types:check && pnpm lint && pnpm prettier:check && pnpm vitest run
```

All pass. `DATABASE_URL=... pnpm test:run` (the 6 server integration tests, run for real rather than skipped) also passes.

Manual checks against `pnpm build && pnpm start` (the production server, not dev) at the time each piece landed:

- [x] **SSR content:** `curl -s localhost:3100/ledertavle | grep -o 'data-theme="[a-z]*"'` etc. showed real player data (`Ada`, `1246`, ...) in the HTML on `/`, `/ledertavle`, `/kamper`, `/ny-kamp`, `/profil/$id` — no spinner.
- [x] **Theme flash:** verified via `curl` with different `Cookie` headers against the production server rather than an actual browser hard-reload — no cookie → light, `theme=dark` → dark, `theme=light` → light, garbage cookie → light (safe fallback). This proves the server renders the right theme; it does not by itself prove there's no flash in a real browser between server HTML and hydration, though `THEME_INIT_SCRIPT` running before first paint is designed to prevent exactly that. Re-verify with a real browser before shipping if that matters.
- [ ] **Cache isolation (two browsers):** not run — no browser automation was available in this session. The per-request-ness was instead verified by reading `@tanstack/start-server-core`'s source (see task 1), which is conclusive for *why* it's per-request but isn't the same as observing it end-to-end in two real browser sessions.
- [ ] **Mutation freshness / navigation pending state:** not run for the same reason — these need a real browser clicking through the app. The unit-level pieces (`onSettled` invalidating both keys, `RoutePending` wired as `defaultPendingComponent`) are in place and type-checked, but end-to-end behavior in a browser is unverified.
- [x] Visited `/finnes-ikke` (an unknown route, same class of check as `/profil/does-not-exist`) against both dev and the production server and got the not-found boundary with the correct wording and an HTTP 404 status.

**Residual:** the two unchecked items above need a real browser (Playwright isn't installed in this repo, per AGENTS.md, and no browser automation was available this session). Whoever picks up the next batch, or does a pre-deploy pass, should click through them once.
