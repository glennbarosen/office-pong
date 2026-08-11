import { describe, expect, it } from 'vitest'
import { MatchService } from '../matchService'
import { validateUniquePlayerName } from '../validation'
import type { Player } from '../../types/pong'

describe('MatchService player name validation', () => {
    const existingPlayers: Player[] = [
        {
            id: '11111111-1111-4111-8111-111111111111',
            name: 'John Doe',
            eloRating: 1200,
            matchesPlayed: 5,
            wins: 3,
            losses: 2,
            createdAt: '2023-01-01T00:00:00.000Z',
        },
        {
            id: '22222222-2222-4222-8222-222222222222',
            name: 'Jane Smith',
            eloRating: 1300,
            matchesPlayed: 8,
            wins: 5,
            losses: 3,
            createdAt: '2023-01-01T00:00:00.000Z',
        },
    ]

    const [johnDoe, janeSmith] = existingPlayers

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

    describe('MatchService.validateMatchCreation', () => {
        it('should throw error when trying to create player 1 with existing name', () => {
            expect(() =>
                MatchService.validateMatchCreation(
                    {
                        player1Type: 'new',
                        player2Type: 'existing',
                        player1Name: 'John Doe',
                        player2Id: janeSmith?.id,
                        player1Score: 11,
                        player2Score: 9,
                    },
                    existingPlayers
                )
            ).toThrow('En spiller med navnet "John Doe" finnes allerede i databasen')
        })

        it('should throw error when trying to create player 2 with existing name', () => {
            expect(() =>
                MatchService.validateMatchCreation(
                    {
                        player1Type: 'existing',
                        player2Type: 'new',
                        player1Id: johnDoe?.id,
                        player2Name: 'Jane Smith',
                        player1Score: 11,
                        player2Score: 9,
                    },
                    existingPlayers
                )
            ).toThrow('En spiller med navnet "Jane Smith" finnes allerede i databasen')
        })

        it('should throw error when trying to create players with existing names (case insensitive)', () => {
            expect(() =>
                MatchService.validateMatchCreation(
                    {
                        player1Type: 'new',
                        player2Type: 'new',
                        player1Name: 'john doe',
                        player2Name: 'JANE SMITH',
                        player1Score: 11,
                        player2Score: 9,
                    },
                    existingPlayers
                )
            ).toThrow('En spiller med navnet "john doe" finnes allerede i databasen')
        })

        it('should allow creating new players with unique names', () => {
            const result = MatchService.validateMatchCreation(
                {
                    player1Type: 'new',
                    player2Type: 'new',
                    player1Name: 'New Player 1',
                    player2Name: 'New Player 2',
                    player1Score: 11,
                    player2Score: 9,
                },
                existingPlayers
            )

            expect(result.player1).toEqual({ type: 'new', name: 'New Player 1' })
            expect(result.player2).toEqual({ type: 'new', name: 'New Player 2' })
            expect(result.player1Score).toBe(11)
            expect(result.player2Score).toBe(9)
        })

        it('should handle whitespace in player names correctly', () => {
            expect(() =>
                MatchService.validateMatchCreation(
                    {
                        player1Type: 'new',
                        player2Type: 'existing',
                        player1Name: '  john doe  ', // Should fail due to existing player
                        player2Id: janeSmith?.id,
                        player1Score: 11,
                        player2Score: 9,
                    },
                    existingPlayers
                )
            ).toThrow('En spiller med navnet "john doe" finnes allerede i databasen')
        })

        it('should reference existing players by id, never by posted rating', () => {
            const result = MatchService.validateMatchCreation(
                {
                    player1Type: 'existing',
                    player2Type: 'existing',
                    player1Id: johnDoe?.id,
                    player2Id: janeSmith?.id,
                    player1Score: 9,
                    player2Score: 11,
                },
                existingPlayers
            )

            expect(result.player1).toEqual({ type: 'existing', id: johnDoe?.id })
            expect(result.player2).toEqual({ type: 'existing', id: janeSmith?.id })
            expect(JSON.stringify(result)).not.toContain('eloRating')
        })

        it('should reject the same existing player on both sides', () => {
            expect(() =>
                MatchService.validateMatchCreation(
                    {
                        player1Type: 'existing',
                        player2Type: 'existing',
                        player1Id: johnDoe?.id,
                        player2Id: johnDoe?.id,
                        player1Score: 11,
                        player2Score: 9,
                    },
                    existingPlayers
                )
            ).toThrow('Spillerne må være forskjellige')
        })

        it('should reject the same new name on both sides', () => {
            expect(() =>
                MatchService.validateMatchCreation(
                    {
                        player1Type: 'new',
                        player2Type: 'new',
                        player1Name: 'Nykommer',
                        player2Name: '  nykommer ',
                        player1Score: 11,
                        player2Score: 9,
                    },
                    existingPlayers
                )
            ).toThrow('Spillerne må være forskjellige')
        })

        it('should reject an unselected existing player', () => {
            expect(() =>
                MatchService.validateMatchCreation(
                    {
                        player1Type: 'existing',
                        player2Type: 'existing',
                        player1Id: '',
                        player2Id: janeSmith?.id,
                        player1Score: 11,
                        player2Score: 9,
                    },
                    existingPlayers
                )
            ).toThrow('Vennligst velg spiller 1')
        })

        it('should reject an invalid score before looking at players', () => {
            expect(() =>
                MatchService.validateMatchCreation(
                    {
                        player1Type: 'existing',
                        player2Type: 'existing',
                        player1Id: johnDoe?.id,
                        player2Id: janeSmith?.id,
                        player1Score: 11,
                        player2Score: 11,
                    },
                    existingPlayers
                )
            ).toThrow('Kampen kan ikke ende uavgjort - én spiller må vinne')
        })
    })
})
