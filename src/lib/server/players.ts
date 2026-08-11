import { createServerFn } from '@tanstack/react-start'
import { pool } from './db'
import { mapPlayerRow, type PlayerRow } from './mappers'
import { playerNameSchema } from '../validation'
import { RATING_CONFIG } from '../../types/pong'

export const PLAYER_COLUMNS = 'id, name, avatar, elo_rating, matches_played, wins, losses, created_at, last_played_at'

export const getPlayers = createServerFn({ method: 'GET' }).handler(async () => {
    const result = await pool.query(`SELECT ${PLAYER_COLUMNS} FROM players ORDER BY elo_rating DESC`)

    return (result.rows as PlayerRow[]).map(mapPlayerRow)
})

export const addPlayer = createServerFn({ method: 'POST' })
    // Validate at the boundary with the same schema the form uses, so the rules
    // cannot drift between client and server.
    .inputValidator((data: { name: string }) => ({ name: playerNameSchema.parse(data.name) }))
    .handler(async ({ data }) => {
        const result = await pool.query(
            `INSERT INTO players (name, elo_rating, matches_played, wins, losses)
             VALUES ($1, $2, 0, 0, 0)
             RETURNING ${PLAYER_COLUMNS}`,
            [data.name, RATING_CONFIG.STARTING_ELO]
        )

        const row = (result.rows as PlayerRow[])[0]
        if (!row) {
            throw new Error('Kunne ikke opprette spilleren')
        }

        return mapPlayerRow(row)
    })
