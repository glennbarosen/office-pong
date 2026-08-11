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
    /**
     * When these two last met. The maximum playedAt of the pairing, not the
     * last one iterated — callers feed matches in both orders (the profile
     * page newest-first, straight from the query; the metrics hook
     * oldest-first, for its ELO curve).
     */
    lastMatch: string
}

/** The outcome of one match from a single player's point of view. */
export type MatchResult = 'win' | 'loss'

/**
 * A player's recent results and current streak, as derived by
 * createFormByPlayer.
 */
export interface PlayerForm {
    /** Newest-first, capped at FORM_LENGTH. */
    recent: MatchResult[]
    /**
     * The run at the head of the player's full history — not capped at
     * FORM_LENGTH, so a 9-match win streak reads as 9, not "5+".
     * null for a player with no matches.
     */
    streak: { type: MatchResult; count: number } | null
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
    /** Rating thresholds for getRatingTier, lowest first. */
    TIERS: [
        { minRating: 1800, tier: 'Stormester', color: 'platinum' },
        { minRating: 1600, tier: 'Mester', color: 'gold' },
        { minRating: 1400, tier: 'Ekspert', color: 'silver' },
        { minRating: 0, tier: 'Nybegynner', color: 'bronze' },
    ] as const,
} as const

/**
 * Table-tennis match rules: score bounds, win condition, deuce handling, and
 * player-name length. Read by validation.ts and (the divisor only) by
 * eloService.ts — see AGENTS.md, which asks that match rules live in those
 * two files plus matchService.ts rather than being reimplemented inline.
 *
 * The database enforces the same rules independently, in
 * `matches_no_draw_check` / `matches_valid_result_check` /
 * `players_name_length_check` (db/init.sql and
 * db/migrations/002_add_constraints.sql). TypeScript cannot reach SQL, so
 * there is no shared source of truth across the two — change both together,
 * or the API and the database will silently disagree about what a valid
 * match looks like.
 */
export const MATCH_RULES = {
    /** A game is first to this many points. */
    WINNING_SCORE: 11,
    /**
     * The winner's margin. At exactly WINNING_SCORE this is a floor — 11-0 is
     * as valid as 11-9. Past WINNING_SCORE (deuce) it is exact: real table
     * tennis deuce games end at precisely +2 (12-10, 13-11, ...), not "+2 or
     * more".
     */
    MIN_WIN_MARGIN: 2,
    /** At exactly WINNING_SCORE, the loser may have any score from 0 up to this. */
    MAX_LOSER_SCORE_AT_WINNING_SCORE: 9,
    /** Past WINNING_SCORE (deuce), both players must have reached at least this. */
    MIN_DEUCE_SCORE: 10,
    /** A recorded score above this is almost certainly a typo, not a real game. */
    MAX_SCORE: 99,
    MIN_PLAYER_NAME_LENGTH: 2,
    MAX_PLAYER_NAME_LENGTH: 50,
} as const
