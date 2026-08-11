import {
    RATING_CONFIG,
    type Player,
    type LeaderboardEntry,
    type Match,
    type MatchWithPlayers,
    type OpponentStats,
} from '../types/pong'

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
 * One player's record against each opponent they have faced, strongest
 * rivalry (most matches) first.
 *
 * Pure, and deliberately not a hook: the profile page renders this as a table
 * and the metrics hook feeds it to a chart, so it cannot live inside
 * components/player-metrics/. `matches` is expected to already be filtered to
 * this player's own matches; ordering is not assumed.
 *
 * Matches whose opponent is absent from `players` are dropped, matching
 * resolveMatchPlayers — the foreign keys make that unreachable in practice.
 */
export function createOpponentStats(matches: Match[], player: Player, players: Player[]): OpponentStats[] {
    const stats = new Map<string, OpponentStats>()

    matches.forEach((match) => {
        const isPlayer1 = match.player1Id === player.id
        const opponentId = isPlayer1 ? match.player2Id : match.player1Id
        const opponent = players.find((p) => p.id === opponentId)

        if (!opponent) return

        const stat = stats.get(opponentId) ?? {
            opponent,
            wins: 0,
            losses: 0,
            winRate: 0,
            totalMatches: 0,
            averageScore: 0,
            eloChange: 0,
            lastMatch: match.playedAt,
        }
        stats.set(opponentId, stat)

        stat.totalMatches++

        if (match.winnerId === player.id) {
            stat.wins++
        } else {
            stat.losses++
        }

        stat.winRate = (stat.wins / stat.totalMatches) * 100
        stat.eloChange += match.eloChanges[player.id] ?? 0

        const playerScore = isPlayer1 ? match.player1Score : match.player2Score
        stat.averageScore = (stat.averageScore * (stat.totalMatches - 1) + playerScore) / stat.totalMatches

        // Max, not last-seen: callers pass both orderings.
        if (match.playedAt > stat.lastMatch) {
            stat.lastMatch = match.playedAt
        }
    })

    return Array.from(stats.values()).sort((a, b) => b.totalMatches - a.totalMatches)
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
