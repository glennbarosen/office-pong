import { describe, test, expect } from 'vitest'
import { createLeaderboardEntries, getRankIcon, createPlayerMap, formatDate, parseInteger } from '../gameUtils'
import { RATING_CONFIG, type Player } from '../../types/pong'

const makePlayer = (overrides: Partial<Player> & { id: string; name: string }): Player => ({
    eloRating: RATING_CONFIG.STARTING_ELO,
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
})

describe('createLeaderboardEntries', () => {
    test('computes win rate from wins over matches played', () => {
        const entries = createLeaderboardEntries([
            makePlayer({ id: '1', name: 'Ada', matchesPlayed: 8, wins: 6, losses: 2 }),
        ])

        expect(entries[0]?.winRate).toBe(75)
    })

    test('reports a 0% win rate rather than NaN for a player with no matches', () => {
        const entries = createLeaderboardEntries([makePlayer({ id: '1', name: 'Ada' })])

        expect(entries[0]?.winRate).toBe(0)
    })

    test(`marks players eligible at ${RATING_CONFIG.MINIMUM_MATCHES_FOR_RANKING} matches`, () => {
        const [justUnder, exactly] = createLeaderboardEntries([
            makePlayer({
                id: '1',
                name: 'Under',
                matchesPlayed: RATING_CONFIG.MINIMUM_MATCHES_FOR_RANKING - 1,
                eloRating: 2000,
            }),
            makePlayer({
                id: '2',
                name: 'Exactly',
                matchesPlayed: RATING_CONFIG.MINIMUM_MATCHES_FOR_RANKING,
                eloRating: 1000,
            }),
        ])

        // Sorted eligible-first, so the lower-rated eligible player leads.
        expect(justUnder?.name).toBe('Exactly')
        expect(justUnder?.isEligibleForRanking).toBe(true)
        expect(exactly?.name).toBe('Under')
        expect(exactly?.isEligibleForRanking).toBe(false)
    })

    test('sorts eligible players by ELO descending', () => {
        const entries = createLeaderboardEntries([
            makePlayer({ id: '1', name: 'Low', matchesPlayed: 10, eloRating: 1100 }),
            makePlayer({ id: '2', name: 'High', matchesPlayed: 10, eloRating: 1400 }),
            makePlayer({ id: '3', name: 'Mid', matchesPlayed: 10, eloRating: 1250 }),
        ])

        expect(entries.map((entry) => entry.name)).toEqual(['High', 'Mid', 'Low'])
    })

    test('sorts ineligible players among themselves by ELO too', () => {
        const entries = createLeaderboardEntries([
            makePlayer({ id: '1', name: 'NewLow', matchesPlayed: 1, eloRating: 1150 }),
            makePlayer({ id: '2', name: 'NewHigh', matchesPlayed: 1, eloRating: 1300 }),
        ])

        expect(entries.map((entry) => entry.name)).toEqual(['NewHigh', 'NewLow'])
    })

    test('returns an empty list for no players', () => {
        expect(createLeaderboardEntries([])).toEqual([])
    })
})

describe('getRankIcon', () => {
    test('returns medals for the top three', () => {
        expect(getRankIcon(1)).toBe('🥇')
        expect(getRankIcon(2)).toBe('🥈')
        expect(getRankIcon(3)).toBe('🥉')
    })

    test('returns a numbered rank below the podium', () => {
        expect(getRankIcon(4)).toBe('4.')
        expect(getRankIcon(27)).toBe('27.')
    })
})

describe('createPlayerMap', () => {
    test('keys players by id', () => {
        const ada = makePlayer({ id: 'a', name: 'Ada' })
        const grace = makePlayer({ id: 'g', name: 'Grace' })

        const map = createPlayerMap([ada, grace])

        expect(map.size).toBe(2)
        expect(map.get('a')).toBe(ada)
        expect(map.get('g')).toBe(grace)
    })

    test('returns an empty map for no players', () => {
        expect(createPlayerMap([]).size).toBe(0)
    })
})

describe('formatDate', () => {
    test('formats as a Norwegian short date by default', () => {
        // Locale output varies by ICU build, so assert on the parts rather than an exact string.
        const formatted = formatDate('2026-03-14T09:05:00.000Z')

        expect(formatted).toContain('14')
        expect(formatted).toContain('2026')
    })

    test('appends a time when includeTime is set', () => {
        const withoutTime = formatDate('2026-03-14T09:05:00.000Z')
        const withTime = formatDate('2026-03-14T09:05:00.000Z', { includeTime: true })

        expect(withTime.startsWith(withoutTime)).toBe(true)
        expect(withTime.length).toBeGreaterThan(withoutTime.length)
        expect(withTime).toMatch(/\d{2}[:.]\d{2}$/)
    })
})

describe('parseInteger', () => {
    test('parses a numeric string', () => {
        expect(parseInteger('11')).toBe(11)
    })

    test('falls back to 0 for unparseable input', () => {
        expect(parseInteger('')).toBe(0)
        expect(parseInteger('abc')).toBe(0)
    })

    test('uses the supplied fallback', () => {
        expect(parseInteger('abc', 7)).toBe(7)
    })

    test('truncates a decimal string rather than rounding', () => {
        expect(parseInteger('11.9')).toBe(11)
    })
})
