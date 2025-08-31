import { z } from 'zod'
import type { Player } from '../types/pong'

/**
 * Check if a player name already exists in the database
 */
export const validateUniquePlayerName = (name: string, existingPlayers: Player[]): boolean => {
    return !existingPlayers.some((player) => player.name.trim().toLowerCase() === name.trim().toLowerCase())
}

/**
 * Validation schema for match scores
 */
export const matchScoreSchema = z
    .object({
        player1Score: z
            .number()
            .int()
            .min(0, 'Poengsum kan ikke være negative')
            .max(99, 'Poengsum kan ikke være over 99'),
        player2Score: z
            .number()
            .int()
            .min(0, 'Poengsum kan ikke være negative')
            .max(99, 'Poengsum kan ikke være over 99'),
    })
    .refine((data) => data.player1Score !== data.player2Score, {
        message: 'Kampen kan ikke ende uavgjort - én spiller må vinne',
        path: ['player1Score'],
    })
    .refine((data) => Math.max(data.player1Score, data.player2Score) >= 11, {
        message: 'Minst én spiller må ha 11 poeng eller mer for å vinne',
        path: ['player1Score'],
    })
    .refine(
        (data) => {
            const maxScore = Math.max(data.player1Score, data.player2Score)
            const minScore = Math.min(data.player1Score, data.player2Score)
            
            // Must win by at least 2 points
            const margin = maxScore - minScore
            if (margin < 2) {
                return false
            }
            
            // If the winner has exactly 11 points, the loser must have 9 or fewer
            // (this covers normal 11-point games: 11-9, 11-8, 11-7, etc.)
            if (maxScore === 11) {
                return minScore <= 9
            }
            
            // If the winner has more than 11 points, this is a deuce situation
            // Both players must have reached at least 10, and winner must win by exactly 2
            // (this covers deuce games: 12-10, 13-11, 14-12, etc.)
            if (maxScore > 11) {
                return minScore >= 10 && margin >= 2
            }
            
            // If winner has less than 11, it's not a valid completed game
            return false
        },
        {
            message: 'Ugyldig resultat: Må vinne med minst 2 poengs margin. Ved 11 poeng kan motstanderen ha 0-9 poeng. Ved deuce (10-10+) må begge ha minst 10 poeng.',
            path: ['player1Score'],
        }
    )

/**
 * Validation schema for new player names
 */
export const playerNameSchema = z
    .string()
    .trim()
    .min(1, 'Spillernavn er påkrevd')
    .min(2, 'Spillernavn må være minst 2 tegn')
    .max(50, 'Spillernavn kan ikke være lengre enn 50 tegn')
    .regex(
        /^[a-zA-ZæøåÆØÅ0-9\s\-_.]+$/,
        'Spillernavn kan kun inneholde bokstaver, tall, mellomrom og grunnleggende tegn'
    )

/**
 * Create a validation schema for new match form that includes existing players check
 */
export const createNewMatchSchema = (existingPlayers: Player[]) =>
    z
        .object({
            player1Type: z.enum(['existing', 'new']),
            player2Type: z.enum(['existing', 'new']),
            player1Id: z.string().optional(),
            player2Id: z.string().optional(),
            player1Name: z.string().optional(),
            player2Name: z.string().optional(),
            player1Score: z.number().int(),
            player2Score: z.number().int(),
        })
        .and(matchScoreSchema)
        .refine(
            (data) => {
                if (data.player1Type === 'existing' && !data.player1Id) {
                    return false
                }
                if (data.player1Type === 'new' && !data.player1Name?.trim()) {
                    return false
                }
                return true
            },
            {
                message: 'Spiller 1 må velges eller navn må oppgis',
                path: ['player1Id'],
            }
        )
        .refine(
            (data) => {
                if (data.player2Type === 'existing' && !data.player2Id) {
                    return false
                }
                if (data.player2Type === 'new' && !data.player2Name?.trim()) {
                    return false
                }
                return true
            },
            {
                message: 'Spiller 2 må velges eller navn må oppgis',
                path: ['player2Id'],
            }
        )
        .refine(
            (data) => {
                // Check if same existing players are selected
                if (data.player1Type === 'existing' && data.player2Type === 'existing') {
                    return data.player1Id !== data.player2Id
                }
                // Check if same names are used for new players
                if (data.player1Type === 'new' && data.player2Type === 'new') {
                    return data.player1Name?.trim().toLowerCase() !== data.player2Name?.trim().toLowerCase()
                }
                return true
            },
            {
                message: 'Spillerne må være forskjellige',
                path: ['player2Id'],
            }
        )
        .refine(
            (data) => {
                // Check if new player 1 name already exists in database
                if (data.player1Type === 'new' && data.player1Name?.trim()) {
                    return validateUniquePlayerName(data.player1Name, existingPlayers)
                }
                return true
            },
            {
                message: 'En spiller med dette navnet finnes allerede i databasen',
                path: ['player1Name'],
            }
        )
        .refine(
            (data) => {
                // Check if new player 2 name already exists in database
                if (data.player2Type === 'new' && data.player2Name?.trim()) {
                    return validateUniquePlayerName(data.player2Name, existingPlayers)
                }
                return true
            },
            {
                message: 'En spiller med dette navnet finnes allerede i databasen',
                path: ['player2Name'],
            }
        )

/**
 * Validation schema for new match form (without existing players check)
 * @deprecated Use createNewMatchSchema instead for better validation
 */
export const newMatchSchema = z
    .object({
        player1Type: z.enum(['existing', 'new']),
        player2Type: z.enum(['existing', 'new']),
        player1Id: z.string().optional(),
        player2Id: z.string().optional(),
        player1Name: z.string().optional(),
        player2Name: z.string().optional(),
        player1Score: z.number().int(),
        player2Score: z.number().int(),
    })
    .and(matchScoreSchema)
    .refine(
        (data) => {
            if (data.player1Type === 'existing' && !data.player1Id) {
                return false
            }
            if (data.player1Type === 'new' && !data.player1Name?.trim()) {
                return false
            }
            return true
        },
        {
            message: 'Spiller 1 må velges eller navn må oppgis',
            path: ['player1Id'],
        }
    )
    .refine(
        (data) => {
            if (data.player2Type === 'existing' && !data.player2Id) {
                return false
            }
            if (data.player2Type === 'new' && !data.player2Name?.trim()) {
                return false
            }
            return true
        },
        {
            message: 'Spiller 2 må velges eller navn må oppgis',
            path: ['player2Id'],
        }
    )
    .refine(
        (data) => {
            // Check if same existing players are selected
            if (data.player1Type === 'existing' && data.player2Type === 'existing') {
                return data.player1Id !== data.player2Id
            }
            // Check if same names are used for new players
            if (data.player1Type === 'new' && data.player2Type === 'new') {
                return data.player1Name?.trim().toLowerCase() !== data.player2Name?.trim().toLowerCase()
            }
            return true
        },
        {
            message: 'Spillerne må være forskjellige',
            path: ['player2Id'],
        }
    )

export type NewMatchFormData = z.infer<typeof newMatchSchema>
