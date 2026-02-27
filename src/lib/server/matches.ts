import { createServerFn } from '@tanstack/react-start'
import { pool } from './db'
import type { Player, Match } from '../../types/pong'
import { EloService } from '../eloService'

export const getMatches = createServerFn({ method: 'GET' }).handler(async () => {
    const result = await pool.query(
        'SELECT id, player1_id, player2_id, winner_id, loser_id, player1_score, player2_score, played_at, elo_changes FROM matches ORDER BY played_at DESC'
    )

    return result.rows.map(
        (row): Match => ({
            id: row.id,
            player1Id: row.player1_id,
            player2Id: row.player2_id,
            winnerId: row.winner_id,
            loserId: row.loser_id,
            player1Score: row.player1_score,
            player2Score: row.player2_score,
            playedAt: row.played_at,
            eloChanges: row.elo_changes ?? {},
        })
    )
})

export const addMatchWithPlayerUpdates = createServerFn({ method: 'POST' })
    .inputValidator(
        (data: {
            matchData: Omit<Match, 'id'>
            winnerData: Player
            loserData: Player
        }) => data
    )
    .handler(async ({ data }) => {
        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            const eloCalculation = EloService.calculateEloChanges(data.winnerData, data.loserData)

            const eloChanges = {
                [data.winnerData.id]: eloCalculation.winnerChange,
                [data.loserData.id]: eloCalculation.loserChange,
            }

            // Insert match
            const matchResult = await client.query(
                `INSERT INTO matches (player1_id, player2_id, winner_id, loser_id, player1_score, player2_score, played_at, elo_changes)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 RETURNING *`,
                [
                    data.matchData.player1Id,
                    data.matchData.player2Id,
                    data.matchData.winnerId,
                    data.matchData.loserId,
                    data.matchData.player1Score,
                    data.matchData.player2Score,
                    data.matchData.playedAt,
                    JSON.stringify(eloChanges),
                ]
            )

            // Update winner
            const winnerUpdates = EloService.calculatePlayerUpdates(
                data.winnerData,
                true,
                eloCalculation.winnerNewRating
            )
            await client.query(
                `UPDATE players SET elo_rating = $1, matches_played = $2, wins = $3, losses = $4, last_played_at = $5 WHERE id = $6`,
                [
                    winnerUpdates.eloRating,
                    winnerUpdates.matchesPlayed,
                    winnerUpdates.wins,
                    winnerUpdates.losses,
                    winnerUpdates.lastPlayedAt,
                    data.winnerData.id,
                ]
            )

            // Update loser
            const loserUpdates = EloService.calculatePlayerUpdates(
                data.loserData,
                false,
                eloCalculation.loserNewRating
            )
            await client.query(
                `UPDATE players SET elo_rating = $1, matches_played = $2, wins = $3, losses = $4, last_played_at = $5 WHERE id = $6`,
                [
                    loserUpdates.eloRating,
                    loserUpdates.matchesPlayed,
                    loserUpdates.wins,
                    loserUpdates.losses,
                    loserUpdates.lastPlayedAt,
                    data.loserData.id,
                ]
            )

            await client.query('COMMIT')

            const row = matchResult.rows[0]
            return {
                id: row.id,
                player1Id: row.player1_id,
                player2Id: row.player2_id,
                winnerId: row.winner_id,
                loserId: row.loser_id,
                player1Score: row.player1_score,
                player2Score: row.player2_score,
                playedAt: row.played_at,
                eloChanges: row.elo_changes ?? {},
            } as Match
        } catch (error) {
            await client.query('ROLLBACK')
            throw error
        } finally {
            client.release()
        }
    })
