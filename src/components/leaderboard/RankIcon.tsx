import type { CSSProperties } from 'react'
import { medalColor } from './medalColor'

/**
 * A leaderboard position as a numbered disc. The top three get a ring and
 * numeral in their medal colour (each verified >= 4.5:1 as text), which
 * replaces emoji medals that rendered differently on every platform.
 *
 * The visible numeral is enough for sighted users; the label spells out
 * "1. plass" so a screen reader does not just say "1".
 */
export function RankIcon({ rank }: { rank: number }) {
    const color = medalColor(rank)
    const style: CSSProperties = color
        ? { color, borderColor: color, borderWidth: 2 }
        : { borderColor: 'var(--jkl-color-border-separator)', borderWidth: 1 }

    return (
        <span
            role="img"
            aria-label={`${rank}. plass`}
            className="tabular inline-flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-solid font-bold"
            style={style}
        >
            {rank}
        </span>
    )
}
