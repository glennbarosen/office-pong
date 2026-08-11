import type { Player } from '../types/pong'
import {
    firstIssueMessage,
    matchScoreSchema,
    playerNameSchema,
    validateUniquePlayerName,
    type CreateMatchInput,
    type PlayerRef,
} from './validation'

export interface MatchCreationData {
    player1Type: 'existing' | 'new'
    player2Type: 'existing' | 'new'
    player1Id?: string
    player2Id?: string
    player1Name?: string
    player2Name?: string
    player1Score: number
    player2Score: number
}

interface PlayerSide {
    type: 'existing' | 'new'
    id?: string
    name?: string
}

export class MatchService {
    /**
     * Validate a match registration and reduce it to the payload the
     * `createMatch` server function accepts.
     *
     * Pure: it neither creates players nor writes anything. The server performs
     * every insert inside one transaction, so a failure cannot leave a new
     * player stranded without their match. Validating here as well keeps the
     * form's error messages immediate and in Norwegian.
     */
    static validateMatchCreation(data: MatchCreationData, players: Player[]): CreateMatchInput {
        const scoreValidation = matchScoreSchema.safeParse({
            player1Score: data.player1Score,
            player2Score: data.player2Score,
        })

        if (!scoreValidation.success) {
            throw new Error(firstIssueMessage(scoreValidation.error))
        }

        const player1 = MatchService.resolveSide(
            { type: data.player1Type, id: data.player1Id, name: data.player1Name },
            players,
            1
        )
        const player2 = MatchService.resolveSide(
            { type: data.player2Type, id: data.player2Id, name: data.player2Name },
            players,
            2
        )

        if (MatchService.isSameSide(player1, player2, players)) {
            throw new Error('Spillerne må være forskjellige')
        }

        return {
            player1,
            player2,
            player1Score: data.player1Score,
            player2Score: data.player2Score,
        }
    }

    /** Validate one side and turn it into an id reference or a new-player name. */
    private static resolveSide(side: PlayerSide, players: Player[], position: 1 | 2): PlayerRef {
        if (side.type === 'new') {
            if (!side.name?.trim()) {
                throw new Error(`Spiller ${position} navn er påkrevd`)
            }

            const nameValidation = playerNameSchema.safeParse(side.name)
            if (!nameValidation.success) {
                throw new Error(`Spiller ${position}: ${firstIssueMessage(nameValidation.error)}`)
            }

            if (!validateUniquePlayerName(side.name, players)) {
                throw new Error(`En spiller med navnet "${side.name.trim()}" finnes allerede i databasen`)
            }

            return { type: 'new', name: side.name.trim() }
        }

        const existingPlayer = players.find((player) => player.id === side.id)
        if (!existingPlayer) {
            throw new Error(`Vennligst velg spiller ${position}`)
        }

        return { type: 'existing', id: existingPlayer.id }
    }

    private static isSameSide(player1: PlayerRef, player2: PlayerRef, players: Player[]): boolean {
        if (player1.type === 'existing' && player2.type === 'existing') {
            return player1.id === player2.id
        }
        if (player1.type === 'new' && player2.type === 'new') {
            return player1.name.toLowerCase() === player2.name.toLowerCase()
        }

        // One of each: a new name matching the chosen player is already rejected
        // by the uniqueness check, but compare explicitly rather than rely on it.
        const newName = player1.type === 'new' ? player1.name : (player2 as { name: string }).name
        const existingId = player1.type === 'existing' ? player1.id : (player2 as { id: string }).id
        const existingPlayer = players.find((player) => player.id === existingId)

        return existingPlayer?.name.trim().toLowerCase() === newName.toLowerCase()
    }
}
