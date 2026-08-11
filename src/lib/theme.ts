import { createIsomorphicFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'

export type Theme = 'light' | 'dark'

/** An explicit choice made with the theme toggle. Wins over everything. */
export const THEME_COOKIE = 'theme'

/**
 * The last OS colour-scheme preference we observed in the browser.
 *
 * Only a hint for SSR, never a user decision: the server cannot see
 * prefers-color-scheme, so without this a dark-mode colleague who has never
 * touched the toggle would be served a light document on every single request.
 */
export const THEME_OS_HINT_COOKIE = 'theme-os'

/** One year — a theme choice should outlive the session that made it. */
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export const DEFAULT_THEME: Theme = 'light'

function parseTheme(value: string | undefined): Theme | undefined {
    return value === 'light' || value === 'dark' ? value : undefined
}

function readCookieInBrowser(name: string): string | undefined {
    return document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))?.[1]
}

/**
 * Cookies rather than localStorage specifically so the server can read them:
 * localStorage is invisible to SSR, which is why the document used to be
 * rendered light and corrected in an effect — a white flash on every load for
 * every dark-mode user.
 */
const readCookie = createIsomorphicFn()
    .server((name: string) => {
        try {
            return getCookie(name)
        } catch {
            // Dev only: after an HMR update Vite's SSR module graph can hand
            // this file the client build of @tanstack/react-start/server, where
            // getCookie does not exist. Losing the theme hint for one render is
            // survivable — THEME_INIT_SCRIPT still corrects it before paint —
            // whereas throwing 500s the whole page on every edit.
            return undefined
        }
    })
    .client(readCookieInBrowser)

export function readExplicitTheme(): Theme | undefined {
    return parseTheme(readCookie(THEME_COOKIE))
}

export function readOsThemeHint(): Theme | undefined {
    return parseTheme(readCookie(THEME_OS_HINT_COOKIE))
}

/**
 * What the document should be rendered as. Must produce the same answer on the
 * server and during hydration, or React will fight the DOM over data-theme.
 */
export function resolveTheme(): Theme {
    return readExplicitTheme() ?? readOsThemeHint() ?? DEFAULT_THEME
}

function writeCookie(name: string, value: string) {
    document.cookie = `${name}=${value}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax`
}

export function writeExplicitTheme(theme: Theme) {
    writeCookie(THEME_COOKIE, theme)
}

export function writeOsThemeHint(theme: Theme) {
    if (readOsThemeHint() === theme) return
    writeCookie(THEME_OS_HINT_COOKIE, theme)
}

/**
 * Runs before hydration, as the first child of <body>.
 *
 * Covers the one case the cookies cannot: a first-ever visitor, where no hint
 * has been recorded yet. From their second page load onwards SSR gets it right
 * on its own and this script is a no-op.
 *
 * Keep it tiny and dependency-free — it is inlined into the document and blocks
 * first paint.
 */
export const THEME_INIT_SCRIPT =
    `(function(){try{` +
    `var c=document.cookie;` +
    `var m=c.match(/(?:^|;\\s*)${THEME_COOKIE}=(light|dark)/)||c.match(/(?:^|;\\s*)${THEME_OS_HINT_COOKIE}=(light|dark)/);` +
    `var t=m?m[1]:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');` +
    `document.body.setAttribute('data-theme',t)` +
    `}catch(e){}})()`
