import { createServerFn } from '@tanstack/react-start'
import { pool } from './db'
import { mapMatchRow, type MatchRow } from './mappers'
import { MATCH_COLUMNS } from './columns'
import { registerMatch } from './matchTransaction'
import { createMatchInputSchema, type CreateMatchInput } from '../validation'

export const getMatches = createServerFn({ method: 'GET' }).handler(async () => {
    const result = await pool.query(`SELECT ${MATCH_COLUMNS} FROM matches ORDER BY played_at DESC`)

    return (result.rows as MatchRow[]).map(mapMatchRow)
})

/**
 * Register a match.
 *
 * The transaction itself lives in ./matchTransaction so that only the handler
 * body — which TanStack Start strips from the client bundle — reaches it. A
 * plain exported function in this module would drag `pg` into the browser.
 */
export const createMatch = createServerFn({ method: 'POST' })
    .inputValidator((data: CreateMatchInput) => createMatchInputSchema.parse(data))
    .handler(({ data }) => registerMatch(data))
