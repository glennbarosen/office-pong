import { getRankIcon } from '../../utils/gameUtils'

/** Ranks above this get a number instead of a medal. */
const MEDAL_RANKS = 3

/**
 * A leaderboard position.
 *
 * The medals are the only signal of the top three positions, so they carry a
 * label — a screen reader otherwise announces nothing useful, or reads the
 * emoji's own name ("1st place medal") in whatever language the user's
 * screen reader happens to use.
 */
export function RankIcon({ rank }: { rank: number }) {
    const icon = getRankIcon(rank)

    if (rank > MEDAL_RANKS) {
        // Already plain text — "4." reads correctly as-is.
        return <span>{icon}</span>
    }

    return (
        <span role="img" aria-label={`${rank}. plass`}>
            {icon}
        </span>
    )
}
