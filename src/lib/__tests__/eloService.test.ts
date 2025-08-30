import { describe, test, expect } from 'vitest'
import { EloService } from '../eloService'
import type { Player } from '../../types/pong'

const createMockPlayer = (id: string, name: string, eloRating: number): Player => ({
    id,
    name,
    eloRating,
    matchesPlayed: 10,
    wins: 5,
    losses: 5,
    createdAt: new Date().toISOString(),
})

describe('EloService', () => {
    describe('calculateEloChanges', () => {
        test('should calculate proper ELO changes for evenly matched players', () => {
            const player1 = createMockPlayer('1', 'Player 1', 1200)
            const player2 = createMockPlayer('2', 'Player 2', 1200)

            const result = EloService.calculateEloChanges(player1, player2)

            expect(result.winnerChange).toBe(16)
            expect(result.loserChange).toBe(-16)
            expect(result.winnerNewRating).toBe(1216)
            expect(result.loserNewRating).toBe(1184)
        })

        test('should give smaller rating change when higher rated player beats lower rated player', () => {
            const higherRatedPlayer = createMockPlayer('1', 'High', 1400)
            const lowerRatedPlayer = createMockPlayer('2', 'Low', 1000)

            const result = EloService.calculateEloChanges(higherRatedPlayer, lowerRatedPlayer)

            expect(result.winnerChange).toBeLessThan(16)
            expect(result.loserChange).toBeGreaterThan(-16)
        })

        test('should give larger rating change when lower rated player beats higher rated player', () => {
            const lowerRatedPlayer = createMockPlayer('1', 'Low', 1000)
            const higherRatedPlayer = createMockPlayer('2', 'High', 1400)

            const result = EloService.calculateEloChanges(lowerRatedPlayer, higherRatedPlayer)

            expect(result.winnerChange).toBeGreaterThan(16)
            expect(result.loserChange).toBeLessThan(-16)
        })
    })

    describe('calculatePlayerUpdates', () => {
        test('should increment wins and matches for winner', () => {
            const player = createMockPlayer('1', 'Player', 1200)
            const updates = EloService.calculatePlayerUpdates(player, true, 1220)

            expect(updates.wins).toBe(6)
            expect(updates.losses).toBe(5)
            expect(updates.matchesPlayed).toBe(11)
            expect(updates.eloRating).toBe(1220)
            expect(updates.lastPlayedAt).toBeDefined()
        })

        test('should increment losses and matches for loser', () => {
            const player = createMockPlayer('1', 'Player', 1200)
            const updates = EloService.calculatePlayerUpdates(player, false, 1180)

            expect(updates.wins).toBe(5)
            expect(updates.losses).toBe(6)
            expect(updates.matchesPlayed).toBe(11)
            expect(updates.eloRating).toBe(1180)
            expect(updates.lastPlayedAt).toBeDefined()
        })
    })

    describe('getRatingTier', () => {
        test('should return correct tiers for different ratings', () => {
            expect(EloService.getRatingTier(1000).tier).toBe('Novice')
            expect(EloService.getRatingTier(1500).tier).toBe('Expert')
            expect(EloService.getRatingTier(1700).tier).toBe('Master')
            expect(EloService.getRatingTier(1900).tier).toBe('Grandmaster')
        })
    })
})
