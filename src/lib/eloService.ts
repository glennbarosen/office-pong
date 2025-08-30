import { RATING_CONFIG } from '../types/pong'
import type { Player } from '../types/pong'

export interface EloCalculationResult {
    winnerNewRating: number
    loserNewRating: number
    winnerChange: number
    loserChange: number
}

export class EloService {
    /**
     * Calculate ELO rating changes for a match between two players
     */
    static calculateEloChanges(winner: Player, loser: Player): EloCalculationResult {
        const { K_FACTOR } = RATING_CONFIG

        const winnerRating = winner.eloRating
        const loserRating = loser.eloRating

        // Calculate expected scores using ELO formula
        const expectedWinnerScore = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400))
        const expectedLoserScore = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400))

        // Calculate rating changes
        const winnerChange = Math.round(K_FACTOR * (1 - expectedWinnerScore))
        const loserChange = Math.round(K_FACTOR * (0 - expectedLoserScore))

        const winnerNewRating = winnerRating + winnerChange
        const loserNewRating = loserRating + loserChange

        return {
            winnerNewRating,
            loserNewRating,
            winnerChange,
            loserChange,
        }
    }

    /**
     * Calculate updated player statistics after a match
     */
    static calculatePlayerUpdates(
        player: Player,
        isWinner: boolean,
        newRating: number
    ): Partial<Omit<Player, 'id'>> {
        return {
            eloRating: newRating,
            matchesPlayed: player.matchesPlayed + 1,
            wins: isWinner ? player.wins + 1 : player.wins,
            losses: isWinner ? player.losses : player.losses + 1,
            lastPlayedAt: new Date().toISOString(),
        }
    }

    /**
     * Get ELO rating display with appropriate styling context
     */
    static getRatingTier(rating: number): {
        tier: string
        color: 'bronze' | 'silver' | 'gold' | 'platinum'
        minRating: number
    } {
        if (rating >= 1800) return { tier: 'Grandmaster', color: 'platinum', minRating: 1800 }
        if (rating >= 1600) return { tier: 'Master', color: 'gold', minRating: 1600 }
        if (rating >= 1400) return { tier: 'Expert', color: 'silver', minRating: 1400 }
        return { tier: 'Novice', color: 'bronze', minRating: 1200 }
    }
}
