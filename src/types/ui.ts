/**
 * Presentation types shared across components.
 *
 * Kept out of `pong.ts`, which AGENTS.md reserves for domain types — a colour
 * palette is not part of the game.
 */

/** An option for a Jøkul NativeSelect, which takes `{ value, label }` items. */
export interface SelectOption {
    value: string
    label: string
}

/** Theme-derived colours handed to the Recharts charts. */
export interface ChartColors {
    primary: string
    success: string
    danger: string
    warning: string
    info: string
    grid: string
    text: string
    line: string
}
