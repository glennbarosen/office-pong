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

export interface MatchWithPlayers extends Omit<Match, 'player1Id' | 'player2Id' | 'winnerId' | 'loserId'> {
    player1: Player
    player2: Player
    winner: Player
    loser: Player
}

export interface HeadToHeadRecord {
    opponent: Player
    wins: number
    losses: number
    winRate: number
    totalMatches: number
    lastMatch?: Match
}

// Configuration constants
export const RATING_CONFIG = {
    STARTING_ELO: 1200,
    K_FACTOR: 32,
    MINIMUM_MATCHES_FOR_RANKING: 5,
} as const
