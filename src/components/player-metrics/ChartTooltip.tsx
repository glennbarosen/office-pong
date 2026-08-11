import type { ReactNode } from 'react'
import type { ChartColors } from '../../types'

interface ChartTooltipProps {
    title: ReactNode
    chartColors: ChartColors
    isMobile: boolean
    /** Narrower on mobile so a long opponent name cannot cover the chart. */
    maxWidth?: string
    children: ReactNode
}

/**
 * The tooltip body shared by all three charts.
 *
 * Each chart used to carry its own copy with `#1f2937` / `#4b5563` hardcoded,
 * ignoring the chartColors it was handed — so tooltips stayed dark in light
 * mode. This one is built from the theme colours.
 */
export function ChartTooltip({ title, chartColors, isMobile, maxWidth, children }: ChartTooltipProps) {
    return (
        <div
            style={{
                backgroundColor: chartColors.tooltipBackground,
                color: chartColors.tooltipText,
                padding: isMobile ? '8px' : '12px',
                border: `1px solid ${chartColors.tooltipBorder}`,
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                fontSize: isMobile ? '12px' : '14px',
                opacity: 1,
                maxWidth: isMobile ? (maxWidth ?? '200px') : 'none',
            }}
        >
            <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>{title}</p>
            {children}
        </div>
    )
}

/** A tooltip line. Charts render several; the last one drops the bottom margin. */
export function ChartTooltipRow({ children, last = false }: { children: ReactNode; last?: boolean }) {
    return <p style={{ margin: last ? '0' : '0 0 4px 0' }}>{children}</p>
}
