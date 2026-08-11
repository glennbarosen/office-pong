import { describe, test, expect } from 'vitest'
import {
    createLeaderboardEntries,
    createOpponentStats,
    getRankIcon,
    createPlayerMap,
    formatDate,
    parseInteger,
} from '../gameUtils'
import { RATING_CONFIG, type Player, type Match } from '../../types/pong'

const makePlayer = (overrides: Partial<Player> & { id: string; name: string }): Player => ({
    eloRating: RATING_CONFIG.STARTING_ELO,
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
})

const makeMatch = (overrides: Partial<Match> & { id: string; player1Id: string; player2Id: string }): Match => ({
    winnerId: overrides.player1Id,
    loserId: overrides.player2Id,
    player1Score: 11,
    player2Score: 5,
    playedAt: '2026-01-01T00:00:00.000Z',
    eloChanges: {},
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

describe('createOpponentStats', () => {
    const ada = makePlayer({ id: 'ada', name: 'Ada' })
    const grace = makePlayer({ id: 'grace', name: 'Grace' })
    const rene = makePlayer({ id: 'rene', name: 'Rene' })

    test('tallies wins, losses and win rate from ada perspective, either side of the match', () => {
        const matches = [
            // Ada wins as player1
            makeMatch({ id: 'm1', player1Id: 'ada', player2Id: 'grace', winnerId: 'ada', loserId: 'grace' }),
            // Ada loses as player2
            makeMatch({
                id: 'm2',
                player1Id: 'grace',
                player2Id: 'ada',
                winnerId: 'grace',
                loserId: 'ada',
                player1Score: 11,
                player2Score: 7,
            }),
        ]

        const [stat] = createOpponentStats(matches, ada, [ada, grace])

        expect(stat?.opponent.id).toBe('grace')
        expect(stat?.wins).toBe(1)
        expect(stat?.losses).toBe(1)
        expect(stat?.totalMatches).toBe(2)
        expect(stat?.winRate).toBe(50)
    })

    test('averages the score from whichever side the player was on', () => {
        const matches = [
            // Ada is player1, scores 11
            makeMatch({ id: 'm1', player1Id: 'ada', player2Id: 'grace', player1Score: 11, player2Score: 5 }),
            // Ada is player2, scores 9
            makeMatch({
                id: 'm2',
                player1Id: 'grace',
                player2Id: 'ada',
                winnerId: 'ada',
                loserId: 'grace',
                player1Score: 7,
                player2Score: 9,
            }),
        ]

        const [stat] = createOpponentStats(matches, ada, [ada, grace])

        expect(stat?.averageScore).toBe(10)
    })

    test('sums the eloChange keyed by the player, defaulting a missing entry to 0', () => {
        const matches = [
            makeMatch({
                id: 'm1',
                player1Id: 'ada',
                player2Id: 'grace',
                eloChanges: { ada: 16, grace: -16 },
            }),
            // No entry for ada — rows predating persisted elo_changes.
            makeMatch({ id: 'm2', player1Id: 'ada', player2Id: 'grace', eloChanges: {} }),
        ]

        const [stat] = createOpponentStats(matches, ada, [ada, grace])

        expect(stat?.eloChange).toBe(16)
    })

    test('lastMatch is the maximum playedAt regardless of input order', () => {
        const older = makeMatch({
            id: 'm1',
            player1Id: 'ada',
            player2Id: 'grace',
            playedAt: '2026-01-01T00:00:00.000Z',
        })
        const newer = makeMatch({
            id: 'm2',
            player1Id: 'ada',
            player2Id: 'grace',
            playedAt: '2026-06-01T00:00:00.000Z',
        })

        const newestFirst = createOpponentStats([newer, older], ada, [ada, grace])
        const oldestFirst = createOpponentStats([older, newer], ada, [ada, grace])

        expect(newestFirst[0]?.lastMatch).toBe(newer.playedAt)
        expect(oldestFirst[0]?.lastMatch).toBe(newer.playedAt)
    })

    test('drops a match whose opponent is not in the players list', () => {
        const matches = [makeMatch({ id: 'm1', player1Id: 'ada', player2Id: 'ghost' })]

        expect(createOpponentStats(matches, ada, [ada])).toEqual([])
    })

    test('sorts by total matches, strongest rivalry first', () => {
        const matches = [
            makeMatch({ id: 'm1', player1Id: 'ada', player2Id: 'grace' }),
            makeMatch({ id: 'm2', player1Id: 'ada', player2Id: 'rene' }),
            makeMatch({ id: 'm3', player1Id: 'ada', player2Id: 'rene' }),
        ]

        const stats = createOpponentStats(matches, ada, [ada, grace, rene])

        expect(stats.map((stat) => stat.opponent.id)).toEqual(['rene', 'grace'])
    })

    test('returns an empty list for no matches', () => {
        expect(createOpponentStats([], ada, [ada, grace])).toEqual([])
    })
})
