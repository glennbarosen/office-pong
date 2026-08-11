import { useEffect, useState } from 'react'
import type { ChartColors } from '../../types'
import { useTheme } from '../../hooks/useTheme'

/**
 * Jøkul defines its palette as CSS custom properties scoped to
 * `[data-theme=light]` / `[data-theme=dark]`.
 *
 * Recharts writes colours as SVG presentation attributes, where `var()` does
 * not resolve — so they have to be read as concrete values rather than passed
 * through as `var(--jkl-...)`.
 */
function readJokulColor(token: string, fallback: string): string {
    if (typeof window === 'undefined') return fallback
    return getComputedStyle(document.body).getPropertyValue(token).trim() || fallback
}

/**
 * Fallbacks for SSR and for the tick between first paint and the effect.
 * Chosen to match the Jøkul tokens they stand in for.
 */
function fallbackColors(isDark: boolean): ChartColors {
    return {
        primary: '#3b82f6',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#06b6d4',
        grid: isDark ? '#374151' : '#e5e7eb',
        text: isDark ? '#d1d5db' : '#374151',
        line: isDark ? '#60a5fa' : '#2563eb',
        tooltipBackground: isDark ? '#1f2937' : '#ffffff',
        tooltipText: isDark ? '#f9fafb' : '#111827',
        tooltipBorder: isDark ? '#4b5563' : '#d1d5db',
        tooltipSuccess: isDark ? '#34d399' : '#047857',
        tooltipDanger: isDark ? '#f87171' : '#b91c1c',
    }
}

function resolveColors(isDark: boolean): ChartColors {
    const fallback = fallbackColors(isDark)

    return {
        ...fallback,
        success: readJokulColor('--jkl-color-functional-success', fallback.success),
        danger: readJokulColor('--jkl-color-functional-error', fallback.danger),
        warning: readJokulColor('--jkl-color-functional-warning', fallback.warning),
        info: readJokulColor('--jkl-color-functional-info', fallback.info),
        primary: readJokulColor('--jkl-color-text-interactive', fallback.primary),
        line: readJokulColor('--jkl-color-text-interactive', fallback.line),
        grid: readJokulColor('--jkl-color-border-separator', fallback.grid),
        text: readJokulColor('--jkl-color-text-subdued', fallback.text),
        tooltipBackground: readJokulColor('--jkl-color-background-container-high', fallback.tooltipBackground),
        tooltipText: readJokulColor('--jkl-color-text-default', fallback.tooltipText),
        tooltipBorder: readJokulColor('--jkl-color-border-separator', fallback.tooltipBorder),
        tooltipSuccess: readJokulColor('--jkl-color-functional-success-dark', fallback.tooltipSuccess),
        tooltipDanger: readJokulColor('--jkl-color-functional-error-dark', fallback.tooltipDanger),
    }
}

/**
 * The chart palette, following the design system and the current theme.
 *
 * The theme comes from useTheme — the one place that owns it. This hook used
 * to run its own MutationObserver on body[data-theme], which was a third
 * independent way of reading the same thing.
 */
export function useThemeColors(): ChartColors {
    const { isDark } = useTheme()
    const [colors, setColors] = useState<ChartColors>(() => fallbackColors(isDark))

    // After paint: useTheme's own effect sets data-theme, and the custom
    // properties only resolve once it has.
    useEffect(() => {
        setColors(resolveColors(isDark))
    }, [isDark])

    return colors
}
