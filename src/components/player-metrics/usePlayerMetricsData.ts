import { useMemo } from 'react'
import type { Player, Match } from '../../types/pong'
import type { OpponentStats, EloHistoryPoint } from '../../types'
import { formatDate } from '../../utils/gameUtils'

export function usePlayerMetricsData(player: Player, matches: Match[], players: Player[]) {
    // Get all matches for this player
    const playerMatches = useMemo(() => {
        const filteredMatches = matches
            // Plain equality: both sides are uuids straight from the database,
            // so there is no whitespace or type variance to defend against.
            .filter((match) => match.player1Id === player.id || match.player2Id === player.id)
            .sort((a, b) => new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime())

        return filteredMatches
    }, [matches, player.id])

    // Calculate opponent statistics
    const opponentStats = useMemo(() => {
        const stats = new Map<string, OpponentStats>()

        playerMatches.forEach((match) => {
            const isPlayer1 = match.player1Id === player.id
            const opponentId = isPlayer1 ? match.player2Id : match.player1Id
            const opponent = players.find((p) => p.id === opponentId)

            if (!opponent) return

            if (!stats.has(opponentId)) {
                stats.set(opponentId, {
                    opponent,
                    wins: 0,
                    losses: 0,
                    winRate: 0,
                    totalMatches: 0,
                    averageScore: 0,
                    eloChange: 0,
                })
            }

            const stat = stats.get(opponentId)!
            stat.totalMatches++

            if (match.winnerId === player.id) {
                stat.wins++
            } else {
                stat.losses++
            }

            stat.winRate = (stat.wins / stat.totalMatches) * 100
            stat.eloChange += match.eloChanges[player.id] || 0

            const playerScore = isPlayer1 ? match.player1Score : match.player2Score
            stat.averageScore = (stat.averageScore * (stat.totalMatches - 1) + playerScore) / stat.totalMatches
        })

        return Array.from(stats.values()).sort((a, b) => b.totalMatches - a.totalMatches)
    }, [playerMatches, player.id, players])

    // Calculate ELO history - showing rating progression over time
    const eloHistory = useMemo(() => {
        if (playerMatches.length === 0) return []

        const history: EloHistoryPoint[] = []

        // Start with the starting ELO (1200) and build forward
        let runningElo = 1200 // Standard chess/ping pong starting rating

        playerMatches.forEach((match, index) => {
            // Apply the ELO change from this match
            const eloChange = match.eloChanges?.[player.id] || 0
            runningElo += eloChange

            const isPlayer1 = match.player1Id === player.id
            const opponentId = isPlayer1 ? match.player2Id : match.player1Id
            const opponent = players.find((p) => p.id === opponentId)

            const matchDate = new Date(match.playedAt)

            history.push({
                matchNumber: index + 1,
                elo: Math.round(runningElo),
                date: formatDate(match.playedAt),
                dateFormatted: matchDate.toISOString().slice(0, 10), // YYYY-MM-DD format
                opponent: opponent?.name || 'Ukjent',
                result: match.winnerId === player.id ? 'Win' : 'Loss',
            })
        })

        // If we have a mismatch with current ELO, adjust proportionally
        if (history.length > 0 && Math.abs(runningElo - player.eloRating) > 10) {
            const adjustment = (player.eloRating - runningElo) / history.length

            history.forEach((point, index) => {
                point.elo = Math.round(point.elo + adjustment * (index + 1))
            })
        }

        return history
    }, [playerMatches, player.id, player.eloRating, players])

    return {
        playerMatches,
        opponentStats,
        eloHistory,
    }
}
