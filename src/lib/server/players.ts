import { createServerFn } from '@tanstack/react-start'
import { pool } from './db'
import { mapPlayerRow, type PlayerRow } from './mappers'
import { PLAYER_COLUMNS } from './columns'

// Players are only ever created as part of registering a match — see
// registerMatch in ./matchTransaction, which inserts them inside the same
// transaction so a failed match cannot leave an orphaned player behind.
// There is deliberately no standalone addPlayer server function.
export const getPlayers = createServerFn({ method: 'GET' }).handler(async () => {
    const result = await pool.query(`SELECT ${PLAYER_COLUMNS} FROM players ORDER BY elo_rating DESC`)

    return (result.rows as PlayerRow[]).map(mapPlayerRow)
})
