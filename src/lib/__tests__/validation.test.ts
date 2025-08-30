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
            expect(result.error?.issues[0].message).toBe('Spilleren må vinne med minst 2 poengs margin hvis resultatet er over 11-9')
        })

        test('should accept valid high scores with proper margin', () => {
            const result = matchScoreSchema.safeParse({
                player1Score: 13,
                player2Score: 11,
            })
            expect(result.success).toBe(true)
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
