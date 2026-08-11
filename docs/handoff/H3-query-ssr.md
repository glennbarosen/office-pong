# H3 — Query client & SSR correctness

**Status:** not started
**Depends on:** H2 (which changes the match server fn's signature — if you do H3 first, expect to touch `useMatches.ts` twice)
**Touches:** `src/router.tsx`, `src/hooks/*`, `src/routes/*`
**Est. size:** M

## Why

The app migrated from a TanStack Router SPA to TanStack Start, but the data layer never followed. No route has a `loader`, so despite full SSR every page ships an empty shell and fetches after hydration. Worse, the `QueryClient` is a module-level singleton, which on the server means one cache shared across every request and every user — the highest-severity bug in the repo.

## Tasks

### 1. Per-request QueryClient — do this first

`src/router.tsx:5-12` creates the `QueryClient` at module scope; `getRouter()` at `:14-21` passes that same instance into router context on every call. In a long-lived Node server (`node .output/server/index.mjs`) that instance is created once at import and reused for the process lifetime, so every SSR render shares one cache.

- [ ] Move the `new QueryClient({...})` call **inside** `getRouter()`. Keep the existing defaults (`retry: 3`, `staleTime: 5 * 60 * 1000`).
- [ ] Confirm `getRouter()` is in fact invoked per request by TanStack Start rather than memoized somewhere — check the generated server entry and `vite.config.ts`'s `tanstackStart()` plugin wiring before declaring this fixed.

**This is the only site that needs changing.** `src/routes/__root.tsx:65` renders a `QueryClientProvider`, but it reads the client from router context via `Route.useRouteContext()` at `:57` (typed by the `RouterContext` interface at `:12-14`) rather than importing the singleton. So moving the construction into the factory propagates everywhere — don't go hunting for a second import.

**Acceptance:** two different browsers hitting the app do not observe each other's cached data. Add a temporary `console.log` in the factory to confirm it runs more than once across requests, then remove it.

### 2. Query key factory

`['players']` and `['matches']` are hand-written inline in six places: `src/hooks/useMatches.ts:7,28,29` and `src/hooks/usePlayers.ts:7,18,31`.

- [ ] Add `src/lib/queryKeys.ts` exporting something like `queryKeys.players` / `queryKeys.matches` with `as const` keys.
- [ ] Replace all six literals. This matters immediately for task 3 — the missing invalidation below is exactly the class of bug a factory prevents.

### 3. Fix the match mutation's cache updates

`src/hooks/useMatches.ts:27-30` prepends the new match via `setQueryData(['matches'], ...)` and invalidates only `['players']`. **`['matches']` is never invalidated**, so the match list's correctness rests entirely on that manual prepend staying accurate forever — and after H2 the server-returned match will be the only source of the real `elo_changes`.

- [ ] Invalidate both keys in `onSettled` (which runs on error too, unlike `onSuccess`).
- [ ] Optionally keep the `setQueryData` prepend as a genuine optimistic update — but then do it properly: move it to `onMutate`, snapshot the previous value, and roll back in `onError`. A prepend in `onSuccess` with no rollback is the worst of both worlds.
- [ ] Same treatment for `useAddPlayer` (`src/hooks/usePlayers.ts:12-21`) if H2 hasn't folded player creation into the match mutation.

### 4. Wire up SSR data loading

All five routes in `src/routes/` are `component:`-only (`index.tsx:4`, `kamper.tsx:4`, `ledertavle.tsx:4`, `ny-kamp.tsx:4`, `profil.$id.tsx:4`). No `loader`, no prefetch, no dehydrate/hydrate boundary — so SSR renders loading states and the real fetch happens client-side.

- [ ] Add `loader: ({ context }) => context.queryClient.ensureQueryData(...)` to each route, using the query options from the hooks. Extract shared `queryOptions` objects so the loader and the hook can't diverge.
- [ ] Set up the dehydrate/hydrate boundary so server-fetched data reaches the client cache instead of being refetched.
- [ ] `src/routes/profil.$id.tsx:8-10` wraps the page in a params-forwarding component that no other route needs. With a loader in place, reconsider whether that wrapper is still necessary.

**Acceptance:** view source (or disable JS) on `/ledertavle` and see actual player rows in the HTML, not a spinner.

### 5. Fix the theme flash

`src/routes/__root.tsx:64` hardcodes `data-theme="light"` on `<body>`. `src/hooks/useTheme.ts:24-26` corrects it in an effect after hydration, so every dark-mode user gets a white flash on every page load. The `useState` initializer at `useTheme.ts:8-11` already returns `'light'` on the server because `localStorage` is unavailable there.

- [ ] Fix it by persisting theme in a **cookie** rather than `localStorage` (`useTheme.ts:10,31,34`), so SSR can read it and render the correct `data-theme` directly — or by emitting a tiny pre-hydration inline script that sets the attribute before first paint. The cookie route is cleaner and works with SSR properly; the script route is smaller.
- [ ] Keep the `typeof window === 'undefined'` guard pattern already at `useTheme.ts:4` — SSR-safety here is load-bearing (it was the subject of a past bug fix, commit `ced9190`).
- [ ] Type the theme state as `'light' | 'dark'` instead of the inferred `string` (`useTheme.ts:8`). Note `prefersColorScheme` from Jøkul's `useBrowserPreferences` may be wider than that union — narrow it explicitly rather than casting.

### 6. Route boundaries

Only `errorComponent` exists, at the root (`src/routes/__root.tsx:26`).

- [ ] Add `pendingComponent` — with loaders in place this is what users see during navigation.
- [ ] Add `notFoundComponent`. `src/pages/Profile.tsx:20-29` currently hand-rolls a "Spiller ikke funnet" screen; a real 404 boundary is the right home for that. Coordinate with H4, which owns the `Profile.tsx` loading-flash bug — whichever of you lands second should reconcile the two.

### 7. Minor cleanups

- [ ] Drop the pointless closures: `queryFn: () => getMatches()` (`useMatches.ts:8`) and `() => getPlayers()` (`usePlayers.ts:8`) can be `queryFn: getMatches` / `getPlayers`.
- [ ] `usePlayers.ts` has two structurally identical mutation hooks. H1 deletes `useUpdatePlayer` (`:23`); if it somehow survived, delete it here.

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
pnpm types:check && pnpm lint && pnpm vitest run
pnpm build && pnpm start    # test SSR against the real production server, not just dev
```

Manual checks — most of these bugs are invisible in dev mode with a warm cache:

- **SSR content:** `curl -s localhost:3000/ledertavle | rg 'Elo|1200'` should show real player data in the HTML.
- **Theme flash:** set dark mode, hard-reload. No white flash. Repeat in a fresh private window.
- **Cache isolation:** with `pnpm start` running, load the app in two different browsers (or one private window). Register a match in one; the other must not see it until it refetches. If browser B shows browser A's data on a cold load, the per-request client isn't actually per-request.
- **Mutation freshness:** register a match, then navigate to `/kamper` and `/ledertavle` without reloading. Both must reflect the new match and the new ratings.
- **Navigation:** click between all routes and confirm the pending state appears rather than a blank frame.
- Visit `/profil/does-not-exist` and confirm you get the not-found boundary.
