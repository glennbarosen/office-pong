// @vitest-environment node
import { describe, expect, test, beforeEach, afterAll } from 'vitest'
import { registerMatch } from '../matchTransaction'
import { pool } from '../db'
import { RATING_CONFIG } from '../../../types/pong'

/**
 * Integration tests for the match transaction. They need a real database —
 * constraints, locking and rollback are the whole point, and none of that can
 * be observed against a mock.
 *
 * Skipped unless DATABASE_URL is set, so `pnpm test:run` stays green in CI
 * (which deliberately runs no database) and for anyone without Docker up.
 * Run them with: pnpm db:up && pnpm test:run
 *
 * These truncate both tables, so point DATABASE_URL at a local database only.
 */
const hasDatabase = Boolean(process.env.DATABASE_URL)

const query = async <T>(sql: string, params: unknown[] = []): Promise<T[]> =>
    (await pool.query(sql, params)).rows as T[]

interface PlayerStats {
    id: string
    name: string
    elo_rating: number
    matches_played: number
    wins: number
    losses: number
}

const playerByName = async (name: string): Promise<PlayerStats | undefined> =>
    (
        await query<PlayerStats>(
            'SELECT id, name, elo_rating, matches_played, wins, losses FROM players WHERE name = $1',
            [name]
        )
    )[0]

describe.skipIf(!hasDatabase)('registerMatch', () => {
    beforeEach(async () => {
        await query('DELETE FROM matches')
        await query('DELETE FROM players')
    })

    afterAll(async () => {
        await pool.end()
    })

    test('creates both players and the match in one transaction', async () => {
        const match = await registerMatch({
            player1: { type: 'new', name: 'Ada' },
            player2: { type: 'new', name: 'Grace' },
            player1Score: 11,
            player2Score: 7,
        })

        const ada = await playerByName('Ada')
        const grace = await playerByName('Grace')

        expect(ada).toBeDefined()
        expect(grace).toBeDefined()
        expect(match.winnerId).toBe(ada?.id)
        expect(match.loserId).toBe(grace?.id)
        expect(ada?.matches_played).toBe(1)
        expect(ada?.wins).toBe(1)
        expect(grace?.losses).toBe(1)
    })

    test('computes ELO from the database, not from the payload', async () => {
        // The payload carries no ratings at all, so the only possible source is
        // the row read inside the transaction.
        const match = await registerMatch({
            player1: { type: 'new', name: 'Ada' },
            player2: { type: 'new', name: 'Grace' },
            player1Score: 11,
            player2Score: 7,
        })

        const ada = await playerByName('Ada')
        const grace = await playerByName('Grace')

        // Equal starting ratings: winner +16, loser -16 at K=32.
        expect(match.eloChanges[match.winnerId]).toBe(16)
        expect(match.eloChanges[match.loserId]).toBe(-16)
        expect(ada?.elo_rating).toBe(RATING_CONFIG.STARTING_ELO + 16)
        expect(grace?.elo_rating).toBe(RATING_CONFIG.STARTING_ELO - 16)
    })

    test('rolls back completely when the second player name collides', async () => {
        await registerMatch({
            player1: { type: 'new', name: 'Ada' },
            player2: { type: 'new', name: 'Grace' },
            player1Score: 11,
            player2Score: 7,
        })

        const before = await query<{ n: number }>('SELECT count(*)::int AS n FROM players')

        await expect(
            registerMatch({
                player1: { type: 'new', name: 'Brand New Person' },
                player2: { type: 'new', name: 'ada' }, // collides case-insensitively
                player1Score: 11,
                player2Score: 2,
            })
        ).rejects.toThrow('finnes allerede i databasen')

        const after = await query<{ n: number }>('SELECT count(*)::int AS n FROM players')

        // The first new player must not survive the failed match.
        expect(after[0]?.n).toBe(before[0]?.n)
        expect(await playerByName('Brand New Person')).toBeUndefined()
    })

    test('rejects the same player on both sides', async () => {
        await registerMatch({
            player1: { type: 'new', name: 'Ada' },
            player2: { type: 'new', name: 'Grace' },
            player1Score: 11,
            player2Score: 7,
        })
        const ada = await playerByName('Ada')

        await expect(
            registerMatch({
                player1: { type: 'existing', id: ada?.id ?? '' },
                player2: { type: 'existing', id: ada?.id ?? '' },
                player1Score: 11,
                player2Score: 3,
            })
        ).rejects.toThrow('Spillerne må være forskjellige')
    })

    test('rejects an invalid result before writing anything', async () => {
        await registerMatch({
            player1: { type: 'new', name: 'Ada' },
            player2: { type: 'new', name: 'Grace' },
            player1Score: 11,
            player2Score: 7,
        })
        const ada = await playerByName('Ada')
        const grace = await playerByName('Grace')

        await expect(
            registerMatch({
                player1: { type: 'existing', id: ada?.id ?? '' },
                player2: { type: 'existing', id: grace?.id ?? '' },
                player1Score: 11,
                player2Score: 11,
            })
        ).rejects.toThrow()

        const matches = await query<{ n: number }>('SELECT count(*)::int AS n FROM matches')
        expect(matches[0]?.n).toBe(1)
    })

    test('does not lose an update when two matches for one player overlap', async () => {
        await registerMatch({
            player1: { type: 'new', name: 'Ada' },
            player2: { type: 'new', name: 'Grace' },
            player1Score: 11,
            player2Score: 7,
        })
        await registerMatch({
            player1: { type: 'new', name: 'Linus' },
            player2: { type: 'new', name: 'Margaret' },
            player1Score: 11,
            player2Score: 7,
        })

        const ada = await playerByName('Ada')
        const grace = await playerByName('Grace')
        const linus = await playerByName('Linus')
        const adaBefore = ada?.matches_played ?? 0

        await Promise.all([
            registerMatch({
                player1: { type: 'existing', id: ada?.id ?? '' },
                player2: { type: 'existing', id: grace?.id ?? '' },
                player1Score: 11,
                player2Score: 5,
            }),
            registerMatch({
                player1: { type: 'existing', id: ada?.id ?? '' },
                player2: { type: 'existing', id: linus?.id ?? '' },
                player1Score: 11,
                player2Score: 6,
            }),
        ])

        const adaAfter = await playerByName('Ada')

        // Both matches must be counted. Without FOR UPDATE the second write
        // would overwrite the first from a stale read and this would be +1.
        expect(adaAfter?.matches_played).toBe(adaBefore + 2)
        expect(adaAfter?.wins).toBe((ada?.wins ?? 0) + 2)
    })
})
