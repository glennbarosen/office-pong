import { useState, useEffect } from 'react'
import type { ChartColors } from './types'

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
            attributeFilter: ['data-theme']
        })

        return () => observer.disconnect()
    }, [])

    // Theme-aware colors
    return {
        primary: '#3b82f6',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#06b6d4',
        // Adaptive colors based on current theme
        grid: currentTheme === 'dark' ? '#374151' : '#e5e7eb',
        text: currentTheme === 'dark' ? '#d1d5db' : '#374151',
        line: currentTheme === 'dark' ? '#60a5fa' : '#2563eb'
    }
}
