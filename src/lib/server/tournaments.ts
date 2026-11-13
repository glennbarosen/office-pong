import { createServerFn } from '@tanstack/react-start'
import { pool } from './db'
import { mapTournamentRow, type TournamentRow } from './mappers'
import { TOURNAMENT_COLUMNS } from './columns'
import {
    endTournamentInputSchema,
    startTournamentInputSchema,
    type EndTournamentInput,
    type StartTournamentInput,
} from '../validation'

/** Postgres unique_violation — here, tournaments_one_active_idx. */
const UNIQUE_VIOLATION = '23505'

export const getTournaments = createServerFn({ method: 'GET' }).handler(async () => {
    const result = await pool.query(`SELECT ${TOURNAMENT_COLUMNS} FROM tournaments ORDER BY created_at DESC`)

    return (result.rows as TournamentRow[]).map(mapTournamentRow)
})

/**
 * Start a tournament. Only one may run at a time — enforced by a partial
 * unique index, not a read-then-write check, so two people pressing "Start"
 * at once cannot both succeed.
 */
export const startTournament = createServerFn({ method: 'POST' })
    .inputValidator((data: StartTournamentInput) => startTournamentInputSchema.parse(data))
    .handler(async ({ data }) => {
        try {
            const result = await pool.query(
                `INSERT INTO tournaments (name) VALUES ($1) RETURNING ${TOURNAMENT_COLUMNS}`,
                [data.name]
            )
            const row = (result.rows as TournamentRow[])[0]
            if (!row) throw new Error('Kunne ikke starte turneringen')
            return mapTournamentRow(row)
        } catch (error) {
            if (error instanceof Error && (error as { code?: string }).code === UNIQUE_VIOLATION) {
                throw new Error('Det pågår allerede en turnering. Avslutt den før du starter en ny.')
            }
            throw error
        }
    })

/** End a running tournament. Its matches keep their tag. */
export const endTournament = createServerFn({ method: 'POST' })
    .inputValidator((data: EndTournamentInput) => endTournamentInputSchema.parse(data))
    .handler(async ({ data }) => {
        const result = await pool.query(
            `UPDATE tournaments SET ended_at = now() WHERE id = $1 AND ended_at IS NULL RETURNING ${TOURNAMENT_COLUMNS}`,
            [data.id]
        )
        const row = (result.rows as TournamentRow[])[0]
        if (!row) throw new Error('Turneringen er allerede avsluttet')
        return mapTournamentRow(row)
    })
