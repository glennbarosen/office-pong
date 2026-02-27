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
    .validator((data: Omit<Player, 'id'>) => data)
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

export const updatePlayer = createServerFn({ method: 'POST' })
    .validator((data: { id: string; updates: Partial<Omit<Player, 'id'>> }) => data)
    .handler(async ({ data }) => {
        const setClauses: string[] = []
        const values: unknown[] = []
        let paramIndex = 1

        if (data.updates.name !== undefined) {
            setClauses.push(`name = $${paramIndex++}`)
            values.push(data.updates.name)
        }
        if (data.updates.avatar !== undefined) {
            setClauses.push(`avatar = $${paramIndex++}`)
            values.push(data.updates.avatar ?? null)
        }
        if (data.updates.eloRating !== undefined) {
            setClauses.push(`elo_rating = $${paramIndex++}`)
            values.push(data.updates.eloRating)
        }
        if (data.updates.matchesPlayed !== undefined) {
            setClauses.push(`matches_played = $${paramIndex++}`)
            values.push(data.updates.matchesPlayed)
        }
        if (data.updates.wins !== undefined) {
            setClauses.push(`wins = $${paramIndex++}`)
            values.push(data.updates.wins)
        }
        if (data.updates.losses !== undefined) {
            setClauses.push(`losses = $${paramIndex++}`)
            values.push(data.updates.losses)
        }
        if (data.updates.lastPlayedAt !== undefined) {
            setClauses.push(`last_played_at = $${paramIndex++}`)
            values.push(data.updates.lastPlayedAt ?? null)
        }

        values.push(data.id)

        const result = await pool.query(
            `UPDATE players SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
            values
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
