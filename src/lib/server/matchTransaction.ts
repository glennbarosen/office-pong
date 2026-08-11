import type { PoolClient } from 'pg'
import { pool } from './db'
import { mapMatchRow, mapPlayerRow, type MatchRow, type PlayerRow } from './mappers'
import { PLAYER_COLUMNS, MATCH_COLUMNS } from './columns'
import { EloService } from '../eloService'
import type { CreateMatchInput, PlayerRef } from '../validation'
import { RATING_CONFIG, type Match, type Player } from '../../types/pong'

/** Postgres unique_violation. */
const UNIQUE_VIOLATION = '23505'

/**
 * Insert a new player, translating the unique-name violation into the same
 * Norwegian message the form shows when it catches the clash client-side.
 */
async function insertPlayer(client: PoolClient, name: string): Promise<string> {
    try {
        const result = await client.query(
            `INSERT INTO players (name, elo_rating, matches_played, wins, losses)
             VALUES ($1, $2, 0, 0, 0)
             RETURNING id`,
            [name, RATING_CONFIG.STARTING_ELO]
        )

        const row = (result.rows as { id: string }[])[0]
        if (!row) {
            throw new Error(`Kunne ikke opprette spilleren "${name}"`)
        }

        return row.id
    } catch (error) {
        if (error instanceof Error && (error as { code?: string }).code === UNIQUE_VIOLATION) {
            throw new Error(`En spiller med navnet "${name}" finnes allerede i databasen`)
        }
        throw error
    }
}

/** Resolve a side of the match to a player id, creating the player if new. */
async function resolvePlayerId(client: PoolClient, ref: PlayerRef): Promise<string> {
    return ref.type === 'new' ? insertPlayer(client, ref.name) : ref.id
}

/**
 * Register a match as a single unit of work.
 *
 * Everything — creating players that don't exist yet, inserting the match and
 * updating both ratings — happens inside one transaction, so a failure anywhere
 * leaves no orphaned players behind.
 *
 * ELO is computed from the player rows read inside the transaction, never from
 * anything the browser posted: a stale tab must not be able to write a wrong
 * rating. `FOR UPDATE` also serializes two concurrent matches that share a
 * player, which would otherwise race on the same rows.
 */
export async function registerMatch(data: CreateMatchInput): Promise<Match> {
    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        const player1Id = await resolvePlayerId(client, data.player1)
        const player2Id = await resolvePlayerId(client, data.player2)

        if (player1Id === player2Id) {
            throw new Error('Spillerne må være forskjellige')
        }

        // Ordered by id so two concurrent matches sharing players always take
        // their locks in the same order, rather than deadlocking.
        const playersResult = await client.query(
            `SELECT ${PLAYER_COLUMNS} FROM players WHERE id = ANY($1::uuid[]) ORDER BY id FOR UPDATE`,
            [[player1Id, player2Id]]
        )

        const playersById = new Map<string, Player>(
            (playersResult.rows as PlayerRow[]).map((row) => {
                const player = mapPlayerRow(row)
                return [player.id, player]
            })
        )

        const player1 = playersById.get(player1Id)
        const player2 = playersById.get(player2Id)
        if (!player1 || !player2) {
            throw new Error('Fant ikke begge spillerne')
        }

        const isPlayer1Winner = data.player1Score > data.player2Score
        const winner = isPlayer1Winner ? player1 : player2
        const loser = isPlayer1Winner ? player2 : player1

        const eloCalculation = EloService.calculateEloChanges(winner, loser)
        const eloChanges = {
            [winner.id]: eloCalculation.winnerChange,
            [loser.id]: eloCalculation.loserChange,
        }

        const matchResult = await client.query(
            `INSERT INTO matches (player1_id, player2_id, winner_id, loser_id, player1_score, player2_score, elo_changes)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING ${MATCH_COLUMNS}`,
            [
                player1Id,
                player2Id,
                winner.id,
                loser.id,
                data.player1Score,
                data.player2Score,
                JSON.stringify(eloChanges),
            ]
        )

        const matchRow = (matchResult.rows as MatchRow[])[0]
        if (!matchRow) {
            throw new Error('Kunne ikke registrere kampen')
        }

        for (const [player, isWinner, newRating] of [
            [winner, true, eloCalculation.winnerNewRating],
            [loser, false, eloCalculation.loserNewRating],
        ] as const) {
            const updates = EloService.calculatePlayerUpdates(player, isWinner, newRating)
            await client.query(
                `UPDATE players SET elo_rating = $1, matches_played = $2, wins = $3, losses = $4, last_played_at = $5 WHERE id = $6`,
                [
                    updates.eloRating,
                    updates.matchesPlayed,
                    updates.wins,
                    updates.losses,
                    updates.lastPlayedAt,
                    player.id,
                ]
            )
        }

        await client.query('COMMIT')

        return mapMatchRow(matchRow)
    } catch (error) {
        await client.query('ROLLBACK')
        throw error
    } finally {
        client.release()
    }
}
