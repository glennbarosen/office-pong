import { createServerFn } from '@tanstack/react-start'
import { pool } from './db'
import type { Player } from '../../types/pong'

export const getPlayers = createServerFn({ method: 'GET' }).handler(async () => {
    const result = await pool.query(
        'SELECT id, name, avatar, elo_rating, matches_played, wins, losses, created_at, last_played_at FROM players ORDER BY elo_rating DESC'
    )

    return result.rows.map(
        (row): Player => ({
            id: row.id,
            name: row.name,
            avatar: row.avatar ?? undefined,
            eloRating: row.elo_rating,
            matchesPlayed: row.matches_played,
            wins: row.wins,
            losses: row.losses,
            createdAt: row.created_at,
            lastPlayedAt: row.last_played_at ?? undefined,
        })
    )
})

export const addPlayer = createServerFn({ method: 'POST' })
    .inputValidator((data: Omit<Player, 'id'>) => data)
    .handler(async ({ data }) => {
        const result = await pool.query(
            `INSERT INTO players (name, avatar, elo_rating, matches_played, wins, losses, created_at, last_played_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [
                data.name,
                data.avatar ?? null,
                data.eloRating,
                data.matchesPlayed,
                data.wins,
                data.losses,
                data.createdAt,
                data.lastPlayedAt ?? null,
            ]
        )

        const row = result.rows[0]
        return {
            id: row.id,
            name: row.name,
            avatar: row.avatar ?? undefined,
            eloRating: row.elo_rating,
            matchesPlayed: row.matches_played,
            wins: row.wins,
            losses: row.losses,
            createdAt: row.created_at,
            lastPlayedAt: row.last_played_at ?? undefined,
        } as Player
    })
