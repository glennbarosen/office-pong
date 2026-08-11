# H5 — Accessibility & UX polish

**Status:** not started
**Depends on:** H4 (same JSX — avoid editing it twice)
**Touches:** `src/components/**`, `src/pages/**`, `src/routes/__root.tsx`, `src/utils/confetti.ts`
**Est. size:** M

## Why

The entire application contains **one** accessibility attribute. `rg 'aria-|role=|alt=|htmlFor|tabIndex|sr-only' src/` returns a single hit: `aria-label="Bytt tema"` at `src/components/header/Header.tsx:15`. Nothing is announced to screen readers, rank and trophy emoji carry meaning with no text alternative, the confetti burst has no reduced-motion escape, and every loading state blanks the whole page.

This is an internal office tool, so the stakes are lower than a public product — but a colleague using a screen reader currently cannot use the leaderboard, and someone with vestibular sensitivity gets a full-screen particle burst with no way out. Both are cheap to fix.

`AGENTS.md` says prefer Jøkul components over raw HTML — Jøkul handles a lot of this correctly out of the box, so **reach for its components before hand-rolling ARIA.**

## Tasks

### 1. Announce asynchronous state

- [ ] `src/components/common/LoadingSpinner.tsx:6-11` is a plain `<div>` with a `'Laster...'` default. Add `role="status"` and `aria-live="polite"` so the change is announced. Check whether Jøkul ships a loader component first.
- [ ] The form error at `src/pages/NewMatch.tsx:115` renders silently. Put it in a live region, set `aria-invalid` on the offending fields, and move focus to the error (or the first bad field) on failed submit.
- [ ] If H4's shared query-state wrapper landed, the error branch there needs the same treatment — one live region for the page rather than per-component.

### 2. Give meaning-bearing emoji text alternatives

These emoji are the *only* signal for their information:

- [ ] Rank medals from `getRankIcon` (`src/utils/gameUtils.ts:24-34`) — 🥇/🥈/🥉 for ranks 1–3, bare numbers after. A screen reader hears nothing useful for the top three. Wrap with visually-hidden text ("1. plass") or add `role="img"` + `aria-label`.
- [ ] Trophy indicators at `src/pages/Overview.tsx:99,110` marking match winners.
- [ ] The 🏓 in the header title (`src/components/header/Header.tsx:10`) is decorative — mark it `aria-hidden="true"` so it isn't read as "ping pong paddle" in the page heading.

The distinction matters: decorative emoji get `aria-hidden`, informational emoji get a label.

### 3. Landmarks and navigation

- [ ] There is no `<nav>` anywhere — `rg '<nav'` is empty. `src/routes/__root.tsx:49` has `<main>` and that's the only landmark. Wrap the header's navigation links in `<nav>`.
- [ ] Add a skip link to `<main>` as the first focusable element.
- [ ] Note that `README.md:15` claims the app has "bottom navigation" and it does not — navigation is the header plus "Se alle" links (`Overview.tsx:77,121`). H7 owns fixing the README; just don't let the claim confuse you into looking for a component that doesn't exist.

### 4. Make the player-type toggle a real control

`src/components/player-card/PlayerCard.tsx:37-52` is two `Button`s whose selected state is purely visual — nothing conveys which of "existing player" / "new player" is active.

- [ ] Convert to a proper radio group: either Jøkul's radio/toggle component (preferred) or `role="radiogroup"` with `aria-checked`. If you keep buttons, `aria-pressed` is the minimum.

### 5. Respect `prefers-reduced-motion`

- [ ] `src/utils/confetti.ts` is ~180 lines of particle bursts (`triggerMatchSuccessConfetti`, called from `src/pages/NewMatch.tsx:65`) with **no** reduced-motion guard — `rg 'reduced-motion' src/` is empty. Check `window.matchMedia('(prefers-reduced-motion: reduce)')` and skip the animation (the `onComplete` callback must still fire, since `NewMatch.tsx` sequences on it).
- [ ] Jøkul's `useBrowserPreferences` (already used in `src/hooks/useTheme.ts:1,7`) may expose this preference — check before adding a raw `matchMedia` call.
- [ ] Audit any CSS transitions in `src/styles/` and the SCSS files for the same guard.

### 6. Replace page-blanking spinners with skeletons

`src/pages/Leaderboard.tsx:20-22`, `Matches.tsx:56-58`, and `Overview.tsx:38-40` each swap the entire page for a text spinner, so every refetch collapses the layout and shifts focus.

- [ ] Render skeleton rows that preserve layout dimensions instead. If H4 extracted a shared query-state wrapper, the skeleton belongs there, parameterized by row count.
- [ ] Keep the `role="status"` announcement from task 1 — a skeleton is silent to a screen reader otherwise.

### 7. Fix the router typing suppression

- [ ] `src/components/common/PlayerLink.tsx:17` carries `// @ts-expect-error - Router typing issue with params` over `params={{ id: playerId }}`. Resolve it properly — this is the generic `Link as={RouterLink}` polymorphism losing route-param types. Options: type the wrapper's props against the route's param type, or use TanStack's `Link` directly with Jøkul styling. If it genuinely can't be typed, keep the suppression but replace the vague comment with a specific explanation and a link to the upstream issue.

### 8. General sweep

- [ ] Verify heading hierarchy — no skipped levels, one `<h1>` per page (`Profile.tsx:24` uses `heading-3` styling on an `<h1>`; that's fine, but check the rest).
- [ ] Check color contrast on the "Mangler kamper" tag and `text-text-subdued` text in both themes.
- [ ] Confirm every interactive element is keyboard reachable and has a visible focus ring — tab through `/ny-kamp` end to end.
- [ ] `<html lang="no">` is already correct (`src/routes/__root.tsx:60`) — leave it.

## Out of scope

| Tempting to fix | Owned by |
|---|---|
| Component dedup, shared types, the Profile loading bug | H4 — land that first |
| Route-level `pendingComponent` | H3 |
| The `data-theme="light"` SSR flash (`__root.tsx:64`) | H3 |
| README's false "bottom navigation" claim | H7 |
| Norwegian string centralization — you'll be adding new user-facing strings here; just inline them consistently with what's around them | H7 |

## Verify

```bash
pnpm types:check && pnpm lint && pnpm prettier:check && pnpm vitest run
pnpm db:up && pnpm dev
```

Automated checks only catch part of this. If H6 has landed and added `eslint-plugin-jsx-a11y`, `pnpm lint` covers the static portion. Then:

- **Keyboard only** — unplug the mouse. Tab through `/ny-kamp` and register a complete match. Then tab through `/`, `/ledertavle`, `/kamper`, and a profile. Every control must be reachable with a visible focus ring, and the skip link must work as the first tab stop.
- **Screen reader** — with VoiceOver (`Cmd+F5`) or Orca, confirm: the leaderboard's top three are announced with their positions, not silence; the loading state is announced; a failed match submit announces the error; the player-type toggle announces which option is selected.
- **Reduced motion** — enable the OS setting (GNOME: `gsettings set org.gnome.desktop.interface enable-animations false`; or override in devtools' Rendering panel) and register a match. No confetti, and the success flow still completes.
- **Layout stability** — throttle to Slow 3G and reload each list page. Skeletons should hold the layout; no jump when data arrives.
- Run Lighthouse's accessibility audit or axe DevTools on each of the five routes and note the remaining findings in this file rather than fixing everything at once.
- Re-check contrast in both light and dark themes.
