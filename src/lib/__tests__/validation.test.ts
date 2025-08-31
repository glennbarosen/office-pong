import { describe, test, expect } from 'vitest'
import { matchScoreSchema, playerNameSchema } from '../validation'

describe('Validation Schemas', () => {
    describe('matchScoreSchema', () => {
        test('should accept valid scores', () => {
            const result = matchScoreSchema.safeParse({
                player1Score: 11,
                player2Score: 9,
            })
            expect(result.success).toBe(true)
        })

        test('should reject tied scores', () => {
            const result = matchScoreSchema.safeParse({
                player1Score: 11,
                player2Score: 11,
            })
            expect(result.success).toBe(false)
            expect(result.error?.issues[0].message).toBe('Kampen kan ikke ende uavgjort - én spiller må vinne')
        })

        test('should reject scores where no player reaches 11', () => {
            const result = matchScoreSchema.safeParse({
                player1Score: 10,
                player2Score: 8,
            })
            expect(result.success).toBe(false)
            expect(result.error?.issues[0].message).toBe('Minst én spiller må ha 11 poeng eller mer for å vinne')
        })

        test('should reject invalid margin when score is above 11', () => {
            const result = matchScoreSchema.safeParse({
                player1Score: 12,
                player2Score: 11,
            })
            expect(result.success).toBe(false)
            expect(result.error?.issues[0].message).toBe('Ugyldig resultat: Må vinne med minst 2 poengs margin. Ved 11 poeng kan motstanderen ha 0-9 poeng. Ved deuce (10-10+) må begge ha minst 10 poeng.')
        })

        test('should accept valid high scores with proper margin', () => {
            const result = matchScoreSchema.safeParse({
                player1Score: 13,
                player2Score: 11,
            })
            expect(result.success).toBe(true)
        })

        test('should accept 11-point wins with any score 9 or below', () => {
            // Test various valid 11-point game scores (winner reached 11, margin of at least 2)
            const validScores = [
                [11, 9], [11, 8], [11, 7], [11, 6], [11, 5], [11, 4], [11, 3], [11, 2], [11, 1], [11, 0],
                [9, 11], [8, 11], [7, 11], [6, 11], [5, 11], [4, 11], [3, 11], [2, 11], [1, 11], [0, 11]
            ]
            
            validScores.forEach(([score1, score2]) => {
                const result = matchScoreSchema.safeParse({
                    player1Score: score1,
                    player2Score: score2,
                })
                expect(result.success).toBe(true)
            })
        })

        test('should reject 11-point wins where opponent has 10 points (no 2-point margin)', () => {
            const result1 = matchScoreSchema.safeParse({
                player1Score: 11,
                player2Score: 10,
            })
            expect(result1.success).toBe(false)

            const result2 = matchScoreSchema.safeParse({
                player1Score: 10,
                player2Score: 11,
            })
            expect(result2.success).toBe(false)
        })

        test('should accept deuce scenarios with proper rules', () => {
            // In deuce situations, both players must have reached at least 10, and winner wins by 2+
            const validDeuceScores = [
                [12, 10], [13, 11], [14, 12], [15, 13], [16, 14], [20, 18],
                [10, 12], [11, 13], [12, 14], [13, 15], [14, 16], [18, 20]
            ]
            
            validDeuceScores.forEach(([score1, score2]) => {
                const result = matchScoreSchema.safeParse({
                    player1Score: score1,
                    player2Score: score2,
                })
                expect(result.success).toBe(true)
            })
        })

        test('should reject invalid deuce scenarios', () => {
            const invalidDeuceScores = [
                // Less than 2-point margin in deuce
                [12, 11], [13, 12], [14, 13], [15, 14],
                [11, 12], [12, 13], [13, 14], [14, 15],
                // Invalid deuce where loser has less than 10 points (should be normal 11-point game)
                [12, 9], [13, 8], [14, 7],
                [9, 12], [8, 13], [7, 14]
            ]
            
            invalidDeuceScores.forEach(([score1, score2]) => {
                const result = matchScoreSchema.safeParse({
                    player1Score: score1,
                    player2Score: score2,
                })
                expect(result.success).toBe(false)
            })
        })

        test('should reject negative scores', () => {
            const result = matchScoreSchema.safeParse({
                player1Score: -1,
                player2Score: 11,
            })
            expect(result.success).toBe(false)
            expect(result.error?.issues[0].message).toBe('Poengsum kan ikke være negative')
        })
    })

    describe('playerNameSchema', () => {
        test('should accept valid names', () => {
            const result = playerNameSchema.safeParse('John Doe')
            expect(result.success).toBe(true)
        })

        test('should reject empty names', () => {
            const result = playerNameSchema.safeParse('')
            expect(result.success).toBe(false)
        })

        test('should reject names that are too short', () => {
            const result = playerNameSchema.safeParse('A')
            expect(result.success).toBe(false)
        })

        test('should reject names with invalid characters', () => {
            const result = playerNameSchema.safeParse('John@Doe')
            expect(result.success).toBe(false)
        })

        test('should accept Norwegian characters', () => {
            const result = playerNameSchema.safeParse('Øystein Åse')
            expect(result.success).toBe(true)
        })

        test('should trim and validate names', () => {
            const result = playerNameSchema.safeParse('  John Doe  ')
            expect(result.success).toBe(true)
            expect(result.data).toBe('John Doe')
        })
    })
})
