export interface Player {
    id: string
    name: string
    avatar?: string
    eloRating: number
    matchesPlayed: number
    wins: number
    losses: number
    createdAt: string
    lastPlayedAt?: string
}

export interface Match {
    id: string
    player1Id: string
    player2Id: string
    winnerId: string
    loserId: string
    player1Score: number
    player2Score: number
    playedAt: string
    eloChanges: {
        [playerId: string]: number
    }
}

export interface LeaderboardEntry extends Player {
    winRate: number
    isEligibleForRanking: boolean
    rank?: number
}

/**
 * A match with its four player references resolved.
 *
 * The single enriched-match shape: both the match list and the overview used
 * to build their own name-only variants of this. Full Player objects rather
 * than names so a row can render anything about a player (ids for links
 * included, via `player1.id`).
 *
 * Per-player ELO deltas are deliberately not fields here — read them from
 * `eloChanges` keyed by the player, which under noUncheckedIndexedAccess types
 * as `number | undefined` and so keeps callers handling rows stored with the
 * schema default '{}'::jsonb. Those rows are what once rendered "+NaN".
 */
export interface MatchWithPlayers extends Omit<Match, 'player1Id' | 'player2Id' | 'winnerId' | 'loserId'> {
    player1: Player
    player2: Player
    winner: Player
    loser: Player
}

/**
 * One player's record against a single opponent.
 *
 * Replaces the old HeadToHeadRecord, which described the same thing with a
 * different set of fields and no callers.
 */
export interface OpponentStats {
    opponent: Player
    wins: number
    losses: number
    winRate: number
    totalMatches: number
    averageScore: number
    eloChange: number
}

/** One point on a player's derived ELO curve. */
export interface EloHistoryPoint {
    matchNumber: number
    elo: number
    date: string
    dateFormatted: string
    opponent: string
    result: 'Win' | 'Loss'
}

// Configuration constants
export const RATING_CONFIG = {
    STARTING_ELO: 1200,
    K_FACTOR: 32,
    MINIMUM_MATCHES_FOR_RANKING: 5,
} as const
