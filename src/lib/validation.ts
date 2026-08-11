import { z } from 'zod'
import { MATCH_RULES, type Player } from '../types/pong'
import { SAME_PLAYER_MESSAGE } from './messages'

/**
 * First validation message from a failed parse.
 *
 * Zod always populates `issues` on failure, but `noUncheckedIndexedAccess`
 * cannot know that, so the fallback exists purely to keep the type honest.
 */
export const firstIssueMessage = (error: z.ZodError, fallback = 'Ugyldig verdi'): string =>
    error.issues[0]?.message ?? fallback

/**
 * Check if a player name already exists in the database
 */
export const validateUniquePlayerName = (name: string, existingPlayers: Player[]): boolean => {
    return !existingPlayers.some((player) => player.name.trim().toLowerCase() === name.trim().toLowerCase())
}

/**
 * Validation schema for match scores
 */
const NEGATIVE_SCORE_MESSAGE = 'Poengsum kan ikke være negative'
const SCORE_TOO_HIGH_MESSAGE = `Poengsum kan ikke være over ${MATCH_RULES.MAX_SCORE}`

export const matchScoreSchema = z
    .object({
        player1Score: z
            .number()
            .int()
            .min(0, NEGATIVE_SCORE_MESSAGE)
            .max(MATCH_RULES.MAX_SCORE, SCORE_TOO_HIGH_MESSAGE),
        player2Score: z
            .number()
            .int()
            .min(0, NEGATIVE_SCORE_MESSAGE)
            .max(MATCH_RULES.MAX_SCORE, SCORE_TOO_HIGH_MESSAGE),
    })
    .refine((data) => data.player1Score !== data.player2Score, {
        message: 'Kampen kan ikke ende uavgjort - én spiller må vinne',
        path: ['player1Score'],
    })
    .refine((data) => Math.max(data.player1Score, data.player2Score) >= MATCH_RULES.WINNING_SCORE, {
        message: `Minst én spiller må ha ${MATCH_RULES.WINNING_SCORE} poeng eller mer for å vinne`,
        path: ['player1Score'],
    })
    .refine(
        (data) => {
            const maxScore = Math.max(data.player1Score, data.player2Score)
            const minScore = Math.min(data.player1Score, data.player2Score)
            const margin = maxScore - minScore

            if (margin < MATCH_RULES.MIN_WIN_MARGIN) {
                return false
            }

            // Exactly WINNING_SCORE: loser may have anything up to
            // MAX_LOSER_SCORE_AT_WINNING_SCORE (normal games: 11-9, 11-8, ...).
            if (maxScore === MATCH_RULES.WINNING_SCORE) {
                return minScore <= MATCH_RULES.MAX_LOSER_SCORE_AT_WINNING_SCORE
            }

            // Past WINNING_SCORE: deuce. Real table tennis deuce games end at
            // exactly +2 (12-10, 13-11, 14-12, ...) — a bigger margin means
            // the game kept going past the point it should have ended, so
            // it's rejected rather than accepted as "won by at least 2".
            if (maxScore > MATCH_RULES.WINNING_SCORE) {
                return minScore >= MATCH_RULES.MIN_DEUCE_SCORE && margin === MATCH_RULES.MIN_WIN_MARGIN
            }

            // Below WINNING_SCORE: not a completed game.
            return false
        },
        {
            message: `Ugyldig resultat: Må vinne med nøyaktig ${MATCH_RULES.MIN_WIN_MARGIN} poengs margin. Ved ${MATCH_RULES.WINNING_SCORE} poeng kan motstanderen ha 0-${MATCH_RULES.MAX_LOSER_SCORE_AT_WINNING_SCORE} poeng. Ved deuce (${MATCH_RULES.MIN_DEUCE_SCORE}-${MATCH_RULES.MIN_DEUCE_SCORE}+) må begge ha minst ${MATCH_RULES.MIN_DEUCE_SCORE} poeng, og vinneren må vinne med nøyaktig ${MATCH_RULES.MIN_WIN_MARGIN}.`,
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
    .min(MATCH_RULES.MIN_PLAYER_NAME_LENGTH, `Spillernavn må være minst ${MATCH_RULES.MIN_PLAYER_NAME_LENGTH} tegn`)
    .max(
        MATCH_RULES.MAX_PLAYER_NAME_LENGTH,
        `Spillernavn kan ikke være lengre enn ${MATCH_RULES.MAX_PLAYER_NAME_LENGTH} tegn`
    )
    .regex(
        /^[a-zA-ZæøåÆØÅ0-9\s\-_.]+$/,
        'Spillernavn kan kun inneholde bokstaver, tall, mellomrom og grunnleggende tegn'
    )

/**
 * One side of a match: either an existing player's id, or the name of a player
 * to create.
 */
export const playerRefSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('existing'), id: z.uuid('Ugyldig spiller-ID') }),
    z.object({ type: z.literal('new'), name: playerNameSchema }),
])

export type PlayerRef = z.infer<typeof playerRefSchema>

/**
 * Payload accepted by the `createMatch` server function.
 *
 * Ids and scores only — no ratings. The server reads current ratings from the
 * database and computes ELO itself, so nothing the browser posts can influence
 * a stored rating.
 */
export const createMatchInputSchema = z
    .object({
        player1: playerRefSchema,
        player2: playerRefSchema,
    })
    .and(matchScoreSchema)
    .refine(
        (data) => {
            if (data.player1.type === 'existing' && data.player2.type === 'existing') {
                return data.player1.id !== data.player2.id
            }
            if (data.player1.type === 'new' && data.player2.type === 'new') {
                return data.player1.name.trim().toLowerCase() !== data.player2.name.trim().toLowerCase()
            }
            return true
        },
        { message: SAME_PLAYER_MESSAGE }
    )

export type CreateMatchInput = z.infer<typeof createMatchInputSchema>
