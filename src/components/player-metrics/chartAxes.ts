import type { ChartColors } from '../../types'

/**
 * Tick/axis styling shared by the line and bar charts, which had identical
 * copies of it including the isMobile font sizing.
 */
export function axisProps(chartColors: ChartColors, isMobile: boolean) {
    return {
        tick: { fontSize: isMobile ? 10 : 12, fill: chartColors.text },
        axisLine: { stroke: chartColors.grid },
        tickLine: { stroke: chartColors.grid },
    }
}

/** The bar chart's category axis packs more labels in, so its ticks run smaller. */
export function categoryAxisProps(chartColors: ChartColors, isMobile: boolean) {
    return {
        ...axisProps(chartColors, isMobile),
        tick: { fontSize: isMobile ? 9 : 11, fill: chartColors.text },
    }
}

/** Y axes reserve a fixed gutter so the charts line up with each other. */
export function yAxisWidth(isMobile: boolean) {
    return isMobile ? 60 : 80
}
