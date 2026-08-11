import { useMemo } from 'react'
import { RATING_CONFIG, type Player, type Match } from '../../types/pong'
import type { OpponentStats, EloHistoryPoint } from '../../types'
import { formatDate } from '../../utils/gameUtils'

interface DeriveEloHistoryOptions {
    /**
     * Nudge the derived curve so it ends at the player's stored rating.
     *
     * Only correct for a player's complete history. A subset filtered to one
     * opponent is not expected to end at the overall rating, so leave it off
     * there — that difference is why this used to exist as two loops.
     */
    reconcileToCurrentRating?: boolean
}

/**
 * Rebuild a player's rating curve by replaying the per-match ELO deltas.
 *
 * The single derivation. It previously existed twice — once in this hook with
 * the reconciliation below, once inline in PlayerMetrics without it — so the
 * filtered and unfiltered charts silently disagreed about how a curve is built.
 */
export function deriveEloHistory(
    playerMatches: Match[],
    player: Player,
    players: Player[],
    { reconcileToCurrentRating = false }: DeriveEloHistoryOptions = {}
): EloHistoryPoint[] {
    if (playerMatches.length === 0) return []

    const history: EloHistoryPoint[] = []
    let runningElo: number = RATING_CONFIG.STARTING_ELO

    playerMatches.forEach((match, index) => {
        runningElo += match.eloChanges[player.id] ?? 0

        const isPlayer1 = match.player1Id === player.id
        const opponentId = isPlayer1 ? match.player2Id : match.player1Id
        const opponent = players.find((p) => p.id === opponentId)

        history.push({
            matchNumber: index + 1,
            elo: Math.round(runningElo),
            date: formatDate(match.playedAt),
            dateFormatted: new Date(match.playedAt).toISOString().slice(0, 10), // YYYY-MM-DD
            opponent: opponent?.name ?? 'Ukjent',
            result: match.winnerId === player.id ? 'Win' : 'Loss',
        })
    })

    // Replaying the deltas can drift from the stored rating — rows predating
    // persisted elo_changes contribute nothing. Spread the difference across
    // the curve so it lands on the real value.
    if (reconcileToCurrentRating && Math.abs(runningElo - player.eloRating) > ELO_RECONCILE_THRESHOLD) {
        const adjustment = (player.eloRating - runningElo) / history.length

        history.forEach((point, index) => {
            point.elo = Math.round(point.elo + adjustment * (index + 1))
        })
    }

    return history
}

/** Below this the derived curve is close enough; nudging it would be noise. */
const ELO_RECONCILE_THRESHOLD = 10

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

            const stat = stats.get(opponentId) ?? {
                opponent,
                wins: 0,
                losses: 0,
                winRate: 0,
                totalMatches: 0,
                averageScore: 0,
                eloChange: 0,
            }
            stats.set(opponentId, stat)

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
    const eloHistory = useMemo(
        // Reconciled against the stored rating: this is the player's whole
        // history, so its end point should be where they actually are.
        () => deriveEloHistory(playerMatches, player, players, { reconcileToCurrentRating: true }),
        [playerMatches, player, players]
    )

    return {
        playerMatches,
        opponentStats,
        eloHistory,
    }
}
