import { RATING_CONFIG, type Player, type LeaderboardEntry, type Match, type MatchWithPlayers } from '../types/pong'

/**
 * Resolve each match's four player ids against a player map.
 *
 * Matches referencing an unknown player are dropped. The foreign keys make
 * that impossible in practice, but resolving to a real Player is what lets
 * one row component serve both the match list and the overview.
 */
export function resolveMatchPlayers(matches: Match[], playerMap: Map<string, Player>): MatchWithPlayers[] {
    return matches.flatMap((match) => {
        const player1 = playerMap.get(match.player1Id)
        const player2 = playerMap.get(match.player2Id)
        const winner = playerMap.get(match.winnerId)
        const loser = playerMap.get(match.loserId)

        if (!player1 || !player2 || !winner || !loser) {
            return []
        }

        return [
            {
                id: match.id,
                player1Score: match.player1Score,
                player2Score: match.player2Score,
                playedAt: match.playedAt,
                eloChanges: match.eloChanges,
                player1,
                player2,
                winner,
                loser,
            },
        ]
    })
}

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
