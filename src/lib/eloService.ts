import { RATING_CONFIG } from '../types/pong'
import type { Player } from '../types/pong'

export interface EloCalculationResult {
    winnerNewRating: number
    loserNewRating: number
    winnerChange: number
    loserChange: number
}

/** Standard ELO scaling: a 400-point rating gap is a 10x expected-score ratio. */
const ELO_RATING_DIVISOR = 400

// TIERS is ordered highest-to-lowest; the last entry (minRating 0) always
// matches, but destructuring it by position keeps that exact rather than
// relying on a computed array index, which noUncheckedIndexedAccess would
// type as possibly undefined.
const [, , , LOWEST_TIER] = RATING_CONFIG.TIERS

export class EloService {
    /**
     * Calculate ELO rating changes for a match between two players
     */
    static calculateEloChanges(winner: Player, loser: Player): EloCalculationResult {
        const { K_FACTOR } = RATING_CONFIG

        const winnerRating = winner.eloRating
        const loserRating = loser.eloRating

        // Calculate expected scores using ELO formula
        const expectedWinnerScore = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / ELO_RATING_DIVISOR))
        const expectedLoserScore = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / ELO_RATING_DIVISOR))

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
    static calculatePlayerUpdates(player: Player, isWinner: boolean, newRating: number): Partial<Omit<Player, 'id'>> {
        return {
            eloRating: newRating,
            matchesPlayed: player.matchesPlayed + 1,
            wins: isWinner ? player.wins + 1 : player.wins,
            losses: isWinner ? player.losses : player.losses + 1,
            lastPlayedAt: new Date().toISOString(),
        }
    }

    /**
     * Get ELO rating display with appropriate styling context.
     *
     * Only referenced by tests today — H8's tier-badge idea is the eventual
     * caller. Tier names stay English pending that UI decision (the rest of
     * the app is Norwegian); translate them when this actually reaches the UI.
     */
    static getRatingTier(rating: number): {
        tier: string
        color: 'bronze' | 'silver' | 'gold' | 'platinum'
        minRating: number
    } {
        // TIERS' last entry has minRating 0, so this always matches for a
        // non-negative rating — but .find()'s return type can't know that.
        return RATING_CONFIG.TIERS.find((tier) => rating >= tier.minRating) ?? LOWEST_TIER
    }
}
