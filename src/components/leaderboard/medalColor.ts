/** Ranks up to this get a medal colour. */
const MEDAL_RANKS = 3

/** Gold, silver, bronze — the contrast-verified tier variables in global.scss. */
const MEDAL_COLOR = ['var(--tier-gold)', 'var(--tier-silver)', 'var(--tier-bronze)'] as const

/** The medal colour for a rank, or undefined outside the top three. */
export function medalColor(rank: number): string | undefined {
    return rank >= 1 && rank <= MEDAL_RANKS ? MEDAL_COLOR[rank - 1] : undefined
}
