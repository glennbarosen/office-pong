import { describe, expect, it, vi } from 'vitest'
import { MatchService } from '../matchService'
import { validateUniquePlayerName } from '../validation'
import type { Player } from '../../types/pong'

describe('MatchService player name validation', () => {
    const existingPlayers: Player[] = [
        {
            id: '1',
            name: 'John Doe',
            eloRating: 1200,
            matchesPlayed: 5,
            wins: 3,
            losses: 2,
            createdAt: '2023-01-01T00:00:00.000Z',
        },
        {
            id: '2',
            name: 'Jane Smith',
            eloRating: 1300,
            matchesPlayed: 8,
            wins: 5,
            losses: 3,
            createdAt: '2023-01-01T00:00:00.000Z',
        },
    ]

    const mockAddPlayer = vi.fn().mockImplementation(async (playerData: Omit<Player, 'id'>) => ({
        ...playerData,
        id: '3',
    }))

    describe('validateUniquePlayerName', () => {
        it('should return true for unique player names', () => {
            expect(validateUniquePlayerName('New Player', existingPlayers)).toBe(true)
            expect(validateUniquePlayerName('Another Player', existingPlayers)).toBe(true)
        })

        it('should return false for existing player names (case insensitive)', () => {
            expect(validateUniquePlayerName('John Doe', existingPlayers)).toBe(false)
            expect(validateUniquePlayerName('john doe', existingPlayers)).toBe(false)
            expect(validateUniquePlayerName('JOHN DOE', existingPlayers)).toBe(false)
            expect(validateUniquePlayerName('Jane Smith', existingPlayers)).toBe(false)
            expect(validateUniquePlayerName('jane smith', existingPlayers)).toBe(false)
        })

        it('should handle names with extra whitespace', () => {
            expect(validateUniquePlayerName('  John Doe  ', existingPlayers)).toBe(false)
            expect(validateUniquePlayerName(' jane smith ', existingPlayers)).toBe(false)
        })
    })

    describe('MatchService.processMatchCreation', () => {
        it('should throw error when trying to create player 1 with existing name', async () => {
            const matchData = {
                player1Type: 'new' as const,
                player2Type: 'existing' as const,
                player1Name: 'John Doe',
                player2Id: '2',
                player1Score: 11,
                player2Score: 9,
            }

            await expect(MatchService.processMatchCreation(matchData, existingPlayers, mockAddPlayer)).rejects.toThrow(
                'En spiller med navnet "John Doe" finnes allerede i databasen'
            )
        })

        it('should throw error when trying to create player 2 with existing name', async () => {
            const matchData = {
                player1Type: 'existing' as const,
                player2Type: 'new' as const,
                player1Id: '1',
                player2Name: 'Jane Smith',
                player1Score: 11,
                player2Score: 9,
            }

            await expect(MatchService.processMatchCreation(matchData, existingPlayers, mockAddPlayer)).rejects.toThrow(
                'En spiller med navnet "Jane Smith" finnes allerede i databasen'
            )
        })

        it('should throw error when trying to create players with existing names (case insensitive)', async () => {
            const matchData = {
                player1Type: 'new' as const,
                player2Type: 'new' as const,
                player1Name: 'john doe',
                player2Name: 'JANE SMITH',
                player1Score: 11,
                player2Score: 9,
            }

            await expect(MatchService.processMatchCreation(matchData, existingPlayers, mockAddPlayer)).rejects.toThrow(
                'En spiller med navnet "john doe" finnes allerede i databasen'
            )
        })

        it('should allow creating new players with unique names', async () => {
            const matchData = {
                player1Type: 'new' as const,
                player2Type: 'new' as const,
                player1Name: 'New Player 1',
                player2Name: 'New Player 2',
                player1Score: 11,
                player2Score: 9,
            }

            const result = await MatchService.processMatchCreation(matchData, existingPlayers, mockAddPlayer)

            expect(result).toBeDefined()
            expect(result.winnerData.name).toBe('New Player 1')
            expect(result.loserData.name).toBe('New Player 2')
            expect(mockAddPlayer).toHaveBeenCalledTimes(2)
        })

        it('should handle whitespace in player names correctly', async () => {
            const matchData = {
                player1Type: 'new' as const,
                player2Type: 'existing' as const,
                player1Name: '  john doe  ', // Should fail due to existing player
                player2Id: '2',
                player1Score: 11,
                player2Score: 9,
            }

            await expect(MatchService.processMatchCreation(matchData, existingPlayers, mockAddPlayer)).rejects.toThrow(
                'En spiller med navnet "john doe" finnes allerede i databasen'
            )
        })
    })
})
