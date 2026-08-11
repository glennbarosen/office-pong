import type { Player, Match } from '../../types/pong'

/**
 * Shapes of the rows the queries in this directory select, mirroring the
 * snake_case columns in `db/init.sql`.
 *
 * `pg` types `result.rows` as `any[]`, so these interfaces are the only place
 * the database shape is stated. Cast a query result to `PlayerRow[]` /
 * `MatchRow[]` once, at the query, and map through the functions below rather
 * than reaching into rows ad hoc.
 */
export interface PlayerRow {
    id: string
    name: string
    avatar: string | null
    elo_rating: number
    matches_played: number
    wins: number
    losses: number
    created_at: Date | string
    last_played_at: Date | string | null
}

export interface MatchRow {
    id: string
    player1_id: string
    player2_id: string
    winner_id: string
    loser_id: string
    player1_score: number
    player2_score: number
    played_at: Date | string
    elo_changes: Record<string, number> | null
}

/** `timestamptz` arrives as a Date from pg but as a string from JSON payloads. */
const toIsoString = (value: Date | string): string => (value instanceof Date ? value.toISOString() : value)

export function mapPlayerRow(row: PlayerRow): Player {
    return {
        id: row.id,
        name: row.name,
        avatar: row.avatar ?? undefined,
        eloRating: row.elo_rating,
        matchesPlayed: row.matches_played,
        wins: row.wins,
        losses: row.losses,
        createdAt: toIsoString(row.created_at),
        lastPlayedAt: row.last_played_at ? toIsoString(row.last_played_at) : undefined,
    }
}

export function mapMatchRow(row: MatchRow): Match {
    return {
        id: row.id,
        player1Id: row.player1_id,
        player2Id: row.player2_id,
        winnerId: row.winner_id,
        loserId: row.loser_id,
        player1Score: row.player1_score,
        player2Score: row.player2_score,
        playedAt: toIsoString(row.played_at),
        eloChanges: row.elo_changes ?? {},
    }
}
