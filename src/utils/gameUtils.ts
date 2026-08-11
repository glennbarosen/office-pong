import { RATING_CONFIG, type Player, type LeaderboardEntry } from '../types/pong'

/**
 * Transform players into leaderboard entries with calculated stats
 */
export function createLeaderboardEntries(players: Player[]): LeaderboardEntry[] {
    return players
        .map((player) => ({
            ...player,
            winRate: player.matchesPlayed > 0 ? (player.wins / player.matchesPlayed) * 100 : 0,
            isEligibleForRanking: player.matchesPlayed >= RATING_CONFIG.MINIMUM_MATCHES_FOR_RANKING,
        }))
        .sort((a, b) => {
            // Eligible players first, then by ELO rating
            if (a.isEligibleForRanking && !b.isEligibleForRanking) return -1
            if (!a.isEligibleForRanking && b.isEligibleForRanking) return 1
            return b.eloRating - a.eloRating
        })
}

/**
 * Get rank icon for leaderboard position
 */
export function getRankIcon(rank: number): string {
    switch (rank) {
        case 1:
            return '🥇'
        case 2:
            return '🥈'
        case 3:
            return '🥉'
        default:
            return `${rank}.`
    }
}

/**
 * Create a player lookup map for efficient player data retrieval
 */
export function createPlayerMap(players: Player[]): Map<string, Player> {
    const playerMap = new Map<string, Player>()
    players.forEach((player) => {
        playerMap.set(player.id, player)
    })
    return playerMap
}

/**
 * Format date consistently across the application
 */
export function formatDate(dateString: string, options: { includeTime?: boolean } = {}): string {
    const date = new Date(dateString)
    const dateFormatted = date.toLocaleDateString('no-NO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })

    if (options.includeTime) {
        const time = date.toLocaleTimeString('no-NO', {
            hour: '2-digit',
            minute: '2-digit',
        })
        return `${dateFormatted} ${time}`
    }

    return dateFormatted
}

/**
 * Safely parse integer with fallback
 */
export function parseInteger(value: string, fallback = 0): number {
    const parsed = parseInt(value, 10)
    return isNaN(parsed) ? fallback : parsed
}
