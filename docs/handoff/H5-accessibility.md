# H5 — Accessibility & UX polish

**Status:** done, on branch `handoff-h3-h7`
**Depends on:** H4 (same JSX — avoid editing it twice)
**Touches:** `src/components/**`, `src/pages/**`, `src/routes/__root.tsx`, `src/utils/confetti.ts`
**Est. size:** M

> **Line references verified against `main` (2026-08-11, at `9935591`).** The headline
> finding is unchanged — `rg 'aria-|role=|alt=|htmlFor|tabIndex|sr-only' src/`
> still returns exactly one hit, and `rg 'reduced-motion' src/` and `rg '<nav'`
> are still empty. Only line numbers in `NewMatch.tsx`, `PlayerLink.tsx`,
> `Matches.tsx` and `confetti.ts` moved.

## Why

The entire application contains **one** accessibility attribute. `rg 'aria-|role=|alt=|htmlFor|tabIndex|sr-only' src/` returns a single hit: `aria-label="Bytt tema"` at `src/components/header/Header.tsx:15`. Nothing is announced to screen readers, rank and trophy emoji carry meaning with no text alternative, the confetti burst has no reduced-motion escape, and every loading state blanks the whole page.

This is an internal office tool, so the stakes are lower than a public product — but a colleague using a screen reader currently cannot use the leaderboard, and someone with vestibular sensitivity gets a full-screen particle burst with no way out. Both are cheap to fix.

`AGENTS.md` says prefer Jøkul components over raw HTML — Jøkul handles a lot of this correctly out of the box, so **reach for its components before hand-rolling ARIA.**

## Tasks

### 1. Announce asynchronous state

- [x] `LoadingSpinner` gets `role="status"` + `aria-live="polite"`.
- [x] The `/ny-kamp` form error now sits in a `role="alert"` live region, and focus moves to it (`ref` + `tabIndex={-1}`) on a failed submit. `PlayerCard` gained a `hasError` prop that sets `aria-invalid` on both cards' inputs — both, not a guessed single field, since the server reports one message for the whole form.
- [x] H4's `QueryState` error branch uses `role="alert"` — one live region for the page.

### 2. Give meaning-bearing emoji text alternatives

These emoji are the *only* signal for their information:

- [x] Rank medals: extracted `RankIcon`, labelling the top three `"1./2./3. plass"`. Used by both the leaderboard table and `LeaderboardCard` (H4's extraction), so both renderings of a rank agree. Ranks past third stay bare text (`getRankIcon` already returns e.g. `"4."`, which reads correctly on its own).
- [x] Trophy indicators — now `aria-label="<name> vant"`, in the consolidated `MatchCard` (see H4 task 3; the trophy exists in exactly one component now, not two).
- [x] The 🏓 in the header is `aria-hidden="true"`.

### 3. Landmarks and navigation

- [x] The "← Hjem" link — the app's actual navigation — is wrapped in a labelled `<nav>`.
- [x] Added a skip link (`"Hopp til hovedinnhold"`) as the first focusable element, hidden until focused. `<main>` gained `id`/`tabIndex={-1}` so the link moves focus, not just scroll position.
- [x] README's "bottom navigation" claim — left alone here as scoped; fixed in H7.5.

### 4. Make the player-type toggle a real control

- [x] Converted to Jøkul's `SegmentedControl` / `SegmentedControlButton` — a real fieldset of radio inputs, not `aria-pressed` bolted onto buttons. Verified in the rendered HTML: two `<fieldset>`s, four `type="radio"` inputs, two `checked`.

### 5. Respect `prefers-reduced-motion`

- [x] `triggerMatchSuccessConfetti` checks `window.matchMedia('(prefers-reduced-motion: reduce)')` and returns immediately (calling `onComplete` first) when set.
- [x] Checked `useBrowserPreferences` first; used raw `matchMedia` instead because this is a plain utility, not a component, and the check needed to live at the source so a future caller can't skip it.
- [x] Audited `src/styles/` for CSS transitions needing the same guard — there are none; Jøkul owns the only animated components.

### 6. Replace page-blanking spinners with skeletons

- [x] `QueryState`'s pending branch renders Jøkul `SkeletonElement` rows via `SkeletonAnimation`, parameterized by `skeletonRows` (default 5).
- [x] Kept the announcement — `role="status"` + `aria-live="polite"` set explicitly on the skeleton container, because `SkeletonAnimation` itself only sets `aria-busy` + `aria-label` (no `role`), which is not dependably exposed on a plain `div`. Caught by a test (`QueryState.test.tsx`) that asserted on the wrong attribute at first.

### 7. Fix the router typing suppression

- [x] `PlayerLink` now goes through `JokulRouterLink` (`createLink(Link)`, already in the codebase and used by `__root.tsx`) instead of `<Link as={RouterLink}>`, which is what was losing the param types. The suppression is gone; confirmed the types are real (not just unsuppressed) by temporarily renaming the param key and getting a compile error naming the expected `{ id: string }`. `rg 'ts-expect-error|ts-ignore' src/` now returns nothing.

### 8. General sweep

- [x] Heading hierarchy: found and fixed a real issue beyond what the doc named — the header's site title was rendered as `<h1>` on *every* page, so `/ny-kamp` and any profile had two `<h1>`s. It's now a styled `<p>` (branding, not a page heading); `Leaderboard.tsx` and `Matches.tsx`, which had no page-level heading of their own, each got one; `Overview.tsx` got a visually-hidden `<h1>` since it's sections rather than a titled document. Verified against a freshly restarted dev server: every route renders exactly one `<h1>`.
- [x] Contrast: computed light/dark ratios from Jøkul's actual `--jkl-color-*` tokens using the WCAG relative-luminance formula (a Python script, not eyeballing) for body text, subdued text, tooltip text, and the `WarningTag` ("Mangler kamper") pairing. All pass AA (≥4.5:1) in both themes — nothing needed changing.
- [x] Keyboard reachability: `rg` found no positive `tabindex` and no `outline`-suppressing CSS anywhere in `src/`; every interactive element is a native control or a Jøkul component built on one, so focus order and rings are the platform default rather than anything hand-rolled that could be wrong. This is inspection, not a real tab-through — see Verify below.
- [x] `<html lang="no">` — confirmed already correct, left alone.

## Out of scope

| Tempting to fix | Owned by |
|---|---|
| Component dedup, shared types, the Profile loading bug | H4 — landed first |
| Route-level `pendingComponent` | H3 |
| The `data-theme="light"` SSR flash (`__root.tsx:64`) | H3 |
| README's false "bottom navigation" claim | H7 |
| Norwegian string centralization | H7 |

## Verify

```bash
pnpm types:check && pnpm lint && pnpm prettier:check && pnpm vitest run
```

All pass.

- [ ] **Keyboard only, screen reader, reduced motion (OS setting), Lighthouse/axe** — none of these were run. They require a real browser and/or a screen reader (VoiceOver/Orca), and no browser automation was available in this session. Everything feeding into them was verified at the code/markup level (native controls, ARIA attributes present in rendered HTML, contrast computed from actual tokens, `matchMedia` guard in place) but **nobody has actually tabbed through the app, listened to a screen reader, or watched the reduced-motion setting take effect end-to-end.**
- [x] **Layout stability:** not throttled to Slow 3G in a real browser, but the mechanism was verified directly — `QueryState`'s pending branch renders fixed-height skeleton rows rather than a centred spinner, confirmed via the component test suite and by reading the rendered markup.

**Residual — the most important gap in this whole handoff.** Everything above that needs a human with a keyboard, a screen reader, or the OS reduced-motion setting is unverified beyond static analysis. This batch should not be considered fully done until someone actually:
1. Unplugs the mouse and tabs through `/ny-kamp`, then the other four routes.
2. Runs a screen reader over the leaderboard, a failed form submit, and the player-type toggle.
3. Confirms the confetti actually skips with the OS reduced-motion setting on (the code path was read, not exercised).
4. Runs axe DevTools or Lighthouse on each route and files what it finds here rather than assuming this doc's list was exhaustive.
