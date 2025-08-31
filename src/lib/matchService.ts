import type { Player, Match } from '../types/pong'
import { matchScoreSchema, playerNameSchema, validateUniquePlayerName } from './validation'
import { RATING_CONFIG } from '../types/pong'

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

export interface ProcessedMatchData {
    matchData: Omit<Match, 'id'>
    winnerData: Player
    loserData: Player
}

export class MatchService {
    /**
     * Validate and process match creation data
     */
    static async processMatchCreation(
        data: MatchCreationData,
        players: Player[],
        addPlayer: (playerData: Omit<Player, 'id'>) => Promise<Player>
    ): Promise<ProcessedMatchData> {
        // Validate scores
        const scoreValidation = matchScoreSchema.safeParse({
            player1Score: data.player1Score,
            player2Score: data.player2Score,
        })

        if (!scoreValidation.success) {
            throw new Error(scoreValidation.error.issues[0].message)
        }

        // Get or create player 1
        let player1Data: Player
        if (data.player1Type === 'new') {
            if (!data.player1Name?.trim()) {
                throw new Error('Spiller 1 navn er påkrevd')
            }

            const nameValidation = playerNameSchema.safeParse(data.player1Name)
            if (!nameValidation.success) {
                throw new Error(`Spiller 1: ${nameValidation.error.issues[0].message}`)
            }

            // Check if player with this name already exists
            if (!validateUniquePlayerName(data.player1Name, players)) {
                throw new Error(`En spiller med navnet "${data.player1Name.trim()}" finnes allerede i databasen`)
            }

            player1Data = await addPlayer({
                name: data.player1Name.trim(),
                eloRating: RATING_CONFIG.STARTING_ELO,
                matchesPlayed: 0,
                wins: 0,
                losses: 0,
                createdAt: new Date().toISOString(),
            })
        } else {
            const existingPlayer1 = players.find((p) => p.id === data.player1Id)
            if (!existingPlayer1) {
                throw new Error('Vennligst velg spiller 1')
            }
            player1Data = existingPlayer1
        }

        // Get or create player 2
        let player2Data: Player
        if (data.player2Type === 'new') {
            if (!data.player2Name?.trim()) {
                throw new Error('Spiller 2 navn er påkrevd')
            }

            const nameValidation = playerNameSchema.safeParse(data.player2Name)
            if (!nameValidation.success) {
                throw new Error(`Spiller 2: ${nameValidation.error.issues[0].message}`)
            }

            // Check if player with this name already exists
            if (!validateUniquePlayerName(data.player2Name, players)) {
                throw new Error(`En spiller med navnet "${data.player2Name.trim()}" finnes allerede i databasen`)
            }

            player2Data = await addPlayer({
                name: data.player2Name.trim(),
                eloRating: RATING_CONFIG.STARTING_ELO,
                matchesPlayed: 0,
                wins: 0,
                losses: 0,
                createdAt: new Date().toISOString(),
            })
        } else {
            const existingPlayer2 = players.find((p) => p.id === data.player2Id)
            if (!existingPlayer2) {
                throw new Error('Vennligst velg spiller 2')
            }
            player2Data = existingPlayer2
        }

        // Check if players are the same
        if (player1Data.name.trim().toLowerCase() === player2Data.name.trim().toLowerCase()) {
            throw new Error('Spillerne må være forskjellige')
        }

        // Determine winner and loser
        const isPlayer1Winner = data.player1Score > data.player2Score
        const winnerData = isPlayer1Winner ? player1Data : player2Data
        const loserData = isPlayer1Winner ? player2Data : player1Data

        const matchData: Omit<Match, 'id'> = {
            player1Id: player1Data.id,
            player2Id: player2Data.id,
            winnerId: winnerData.id,
            loserId: loserData.id,
            player1Score: data.player1Score,
            player2Score: data.player2Score,
            playedAt: new Date().toISOString(),
            eloChanges: {}, // Will be calculated in DataService
        }

        return {
            matchData,
            winnerData,
            loserData,
        }
    }
}
