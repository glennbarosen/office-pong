import { useState, useEffect } from 'react'
import type { ChartColors } from '../../types'

export function useThemeColors(): ChartColors {
    const [currentTheme, setCurrentTheme] = useState<string>('light')

    // Watch for theme changes
    useEffect(() => {
        const updateTheme = () => {
            const theme = document.body.getAttribute('data-theme') || 'light'
            setCurrentTheme(theme)
        }

        // Initial theme
        updateTheme()

        // Watch for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    updateTheme()
                }
            })
        })

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['data-theme'],
        })

        return () => observer.disconnect()
    }, [])

    const isDark = currentTheme === 'dark'

    // Theme-aware colors
    return {
        primary: '#3b82f6',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#06b6d4',
        // Adaptive colors based on current theme
        grid: isDark ? '#374151' : '#e5e7eb',
        text: isDark ? '#d1d5db' : '#374151',
        line: isDark ? '#60a5fa' : '#2563eb',
        // The tooltips used to hardcode the dark surface regardless of theme.
        tooltipBackground: isDark ? '#1f2937' : '#ffffff',
        tooltipText: isDark ? '#f9fafb' : '#111827',
        tooltipBorder: isDark ? '#4b5563' : '#d1d5db',
        tooltipSuccess: isDark ? '#34d399' : '#047857',
        tooltipDanger: isDark ? '#f87171' : '#b91c1c',
    }
}
