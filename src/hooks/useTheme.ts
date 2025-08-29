import { useBrowserPreferences } from '@fremtind/jokul'
import { useEffect, useState } from 'react'

export const useTheme = () => {
    const { prefersColorScheme } = useBrowserPreferences()
    const themeFromLocalStorage = localStorage.getItem('theme')
    const [theme, setTheme] = useState(themeFromLocalStorage ?? prefersColorScheme)

    const isDark = theme === 'dark'

    useEffect(() => {
        document.body.setAttribute('data-theme', theme)
    }, [theme])

    useEffect(() => {
        if (themeFromLocalStorage) {
            setTheme(themeFromLocalStorage)
        } else {
            setTheme(prefersColorScheme)
        }
    }, [themeFromLocalStorage, prefersColorScheme])

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
