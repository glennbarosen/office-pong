import { useBrowserPreferences } from '@fremtind/jokul/hooks'
import { useEffect, useState } from 'react'

const isServer = typeof window === 'undefined'

export const useTheme = () => {
    const { prefersColorScheme } = useBrowserPreferences()
    const [theme, setTheme] = useState(() => {
        if (isServer) return 'light'
        return localStorage.getItem('theme') ?? prefersColorScheme
    })

    const isDark = theme === 'dark'

    useEffect(() => {
        const stored = localStorage.getItem('theme')
        if (stored) {
            setTheme(stored)
        } else {
            setTheme(prefersColorScheme)
        }
    }, [prefersColorScheme])

    useEffect(() => {
        document.body.setAttribute('data-theme', theme)
    }, [theme])

    const toggleTheme = () => {
        if (theme === 'light') {
            setTheme('dark')
            localStorage.setItem('theme', 'dark')
        } else if (theme === 'dark') {
            setTheme('light')
            localStorage.setItem('theme', 'light')
        }
    }

    return { isDark, toggleTheme }
}
