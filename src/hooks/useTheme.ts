import { useBrowserPreferences } from '@fremtind/jokul/hooks'
import { useEffect, useState } from 'react'
import { readExplicitTheme, resolveTheme, writeExplicitTheme, writeOsThemeHint, type Theme } from '../lib/theme'

export const useTheme = () => {
    const { prefersColorScheme } = useBrowserPreferences()
    // resolveTheme, not prefersColorScheme, so the first client render matches
    // what the server rendered and hydration has nothing to correct.
    const [theme, setTheme] = useState<Theme>(resolveTheme)

    const isDark = theme === 'dark'

    useEffect(() => {
        // Record the OS preference for the next SSR pass, whether or not it is
        // what we are currently showing.
        writeOsThemeHint(prefersColorScheme)
        // With no explicit choice on record, follow the OS — including the user
        // changing it mid-session, since useBrowserPreferences is reactive.
        if (readExplicitTheme()) return
        setTheme(prefersColorScheme)
    }, [prefersColorScheme])

    useEffect(() => {
        document.body.setAttribute('data-theme', theme)
    }, [theme])

    const toggleTheme = () => {
        const next: Theme = theme === 'dark' ? 'light' : 'dark'
        setTheme(next)
        writeExplicitTheme(next)
    }

    return { isDark, theme, toggleTheme }
}
