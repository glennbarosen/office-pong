import {
    RATING_CONFIG,
    type Player,
    type LeaderboardEntry,
    type Match,
    type MatchWithPlayers,
    type OpponentStats,
    type MatchResult,
    type PlayerForm,
} from '../types/pong'

/** How many recent results the "form" (e.g. WWLWW) shows. */
export const FORM_LENGTH = 5

/**
 * Resolve each match's four player ids against a player map.
 *
 * Matches referencing an unknown player are dropped. The foreign keys make
 * that impossible in practice, but resolving to a real Player is what lets
 * one row component serve both the match list and the overview.
 */
export function resolveMatchPlayers(matches: Match[], playerMap: Map<string, Player>): MatchWithPlayers[] {
    return matches.flatMap((match) => {
        const player1 = playerMap.get(match.player1Id)
        const player2 = playerMap.get(match.player2Id)
        const winner = playerMap.get(match.winnerId)
        const loser = playerMap.get(match.loserId)

        if (!player1 || !player2 || !winner || !loser) {
            return []
        }

        return [
            {
                id: match.id,
                player1Score: match.player1Score,
                player2Score: match.player2Score,
                playedAt: match.playedAt,
                eloChanges: match.eloChanges,
                player1,
                player2,
                winner,
                loser,
            },
        ]
    })
}

/**
 * Transform players into leaderboard entries with calculated stats
 */
export function createLeaderboardEntries(players: Player[]): LeaderboardEntry[] {
    return players
        .map((player) => ({
            ...player,
            winRate: player.matchesPlayed > 0 ? (player.wins / player.matchesPlayed) * 100 : 0,
            isEligibleForRanking: player.matchesPlayed >= RATING_CONFIG.MINIMUM_MATCHES_FOR_RANKING,
        }))
        .sort((a, b) => {
            // Eligible players first, then by ELO rating
            if (a.isEligibleForRanking && !b.isEligibleForRanking) return -1
            if (!a.isEligibleForRanking && b.isEligibleForRanking) return 1
            return b.eloRating - a.eloRating
        })
}

/**
 * One player's record against each opponent they have faced, strongest
 * rivalry (most matches) first.
 *
 * Pure, and deliberately not a hook: the profile page renders this as a table
 * and the metrics hook feeds it to a chart, so it cannot live inside
 * components/player-metrics/. `matches` is expected to already be filtered to
 * this player's own matches; ordering is not assumed.
 *
 * Matches whose opponent is absent from `players` are dropped, matching
 * resolveMatchPlayers — the foreign keys make that unreachable in practice.
 */
export function createOpponentStats(matches: Match[], player: Player, players: Player[]): OpponentStats[] {
    const stats = new Map<string, OpponentStats>()

    matches.forEach((match) => {
        const isPlayer1 = match.player1Id === player.id
        const opponentId = isPlayer1 ? match.player2Id : match.player1Id
        const opponent = players.find((p) => p.id === opponentId)

        if (!opponent) return

        const stat = stats.get(opponentId) ?? {
            opponent,
            wins: 0,
            losses: 0,
            winRate: 0,
            totalMatches: 0,
            averageScore: 0,
            eloChange: 0,
            lastMatch: match.playedAt,
        }
        stats.set(opponentId, stat)

        stat.totalMatches++

        if (match.winnerId === player.id) {
            stat.wins++
        } else {
            stat.losses++
        }

        stat.winRate = (stat.wins / stat.totalMatches) * 100
        stat.eloChange += match.eloChanges[player.id] ?? 0

        const playerScore = isPlayer1 ? match.player1Score : match.player2Score
        stat.averageScore = (stat.averageScore * (stat.totalMatches - 1) + playerScore) / stat.totalMatches

        // Max, not last-seen: callers pass both orderings.
        if (match.playedAt > stat.lastMatch) {
            stat.lastMatch = match.playedAt
        }
    })

    return Array.from(stats.values()).sort((a, b) => b.totalMatches - a.totalMatches)
}

/**
 * Every player's recent form and current streak, derived from a shared set of
 * matches in one pass.
 *
 * A single function producing a Map for every player, rather than something
 * called once per row from a render loop over players — the leaderboard would
 * otherwise re-filter the same match list once per player on every render.
 * Ordering of `matches` is not assumed; each player's own history is sorted
 * by playedAt before the streak or form is read off it.
 */
export function createFormByPlayer(matches: Match[], limit: number = FORM_LENGTH): Map<string, PlayerForm> {
    const matchesByPlayer = new Map<string, Match[]>()

    matches.forEach((match) => {
        for (const playerId of [match.player1Id, match.player2Id]) {
            const playerMatches = matchesByPlayer.get(playerId) ?? []
            playerMatches.push(match)
            matchesByPlayer.set(playerId, playerMatches)
        }
    })

    const formByPlayer = new Map<string, PlayerForm>()

    matchesByPlayer.forEach((playerMatches, playerId) => {
        const results: MatchResult[] = [...playerMatches]
            .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime())
            .map((match) => (match.winnerId === playerId ? 'win' : 'loss'))

        formByPlayer.set(playerId, {
            recent: results.slice(0, limit),
            streak: computeStreak(results),
        })
    })

    return formByPlayer
}

/** The run of identical results at the head of a newest-first result list. */
function computeStreak(results: MatchResult[]): PlayerForm['streak'] {
    const mostRecent = results[0]
    if (!mostRecent) return null

    let count = 0
    for (const result of results) {
        if (result !== mostRecent) break
        count++
    }

    return { type: mostRecent, count }
}

/**
 * First grapheme of a name's first word plus the first grapheme of its last
 * word — the fallback PlayerAvatar shows for a player with no avatar image.
 *
 * Array.from, not indexing: a name may contain a character outside the BMP,
 * and Æ/Ø/Å must survive as themselves rather than being read as half a
 * surrogate pair.
 */
export function initialsForName(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean)
    if (words.length === 0) return ''

    const firstLetter = (word: string) => Array.from(word)[0] ?? ''

    const first = firstLetter(words[0] ?? '')
    const last = words.length > 1 ? firstLetter(words[words.length - 1] ?? '') : ''

    return (first + last).toUpperCase()
}

/**
 * Create a player lookup map for efficient player data retrieval
 */
export function createPlayerMap(players: Player[]): Map<string, Player> {
    const playerMap = new Map<string, Player>()
    players.forEach((player) => {
        playerMap.set(player.id, player)
    })
    return playerMap
}

/**
 * The office's time zone. Every date shown is formatted in it explicitly
 * rather than in the runtime's zone: the server renders in UTC and the browser
 * in Oslo time, and the two disagreeing about "09:05" vs "10:05" — or about
 * which day a late match belongs to — is a hydration mismatch.
 */
export const TIME_ZONE = 'Europe/Oslo'

const LOCALE = 'nb-NO'

/**
 * Format date consistently across the application
 */
export function formatDate(dateString: string, options: { includeTime?: boolean } = {}): string {
    const dateFormatted = new Date(dateString).toLocaleDateString(LOCALE, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: TIME_ZONE,
    })

    if (options.includeTime) {
        return `${dateFormatted} ${formatTime(dateString)}`
    }

    return dateFormatted
}

/** "09:05", in the office's time zone. */
export function formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString(LOCALE, {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: TIME_ZONE,
    })
}

/** The calendar day a moment falls on in the office, as YYYY-MM-DD. */
export function dayKey(date: string | Date): string {
    // en-CA formats as ISO YYYY-MM-DD, which is what makes this a sortable key.
    return new Date(date).toLocaleDateString('en-CA', { timeZone: TIME_ZONE })
}

/** Whole calendar days between two YYYY-MM-DD keys (b - a). */
function daysBetween(a: string, b: string): number {
    return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000)
}

/** "I dag", "I går", or e.g. "fredag 13. mars" for a day key from dayKey. */
export function formatDayLabel(key: string, now: Date = new Date()): string {
    const diff = daysBetween(key, dayKey(now))
    if (diff === 0) return 'I dag'
    if (diff === 1) return 'I går'

    const sameYear = key.slice(0, 4) === dayKey(now).slice(0, 4)
    const label = new Date(`${key}T12:00:00Z`).toLocaleDateString(LOCALE, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        ...(sameYear ? {} : { year: 'numeric' }),
        timeZone: 'UTC',
    })
    return label.charAt(0).toUpperCase() + label.slice(1)
}

export interface MatchDayGroup<T> {
    key: string
    label: string
    matches: T[]
}

/**
 * Group matches by the office calendar day they were played on, preserving the
 * input order both of the groups and within them (callers pass newest-first).
 */
export function groupMatchesByDay<T extends { playedAt: string }>(
    matches: T[],
    now: Date = new Date()
): MatchDayGroup<T>[] {
    const groups: MatchDayGroup<T>[] = []
    const byKey = new Map<string, MatchDayGroup<T>>()

    for (const match of matches) {
        const key = dayKey(match.playedAt)
        let group = byKey.get(key)
        if (!group) {
            group = { key, label: formatDayLabel(key, now), matches: [] }
            byKey.set(key, group)
            groups.push(group)
        }
        group.matches.push(match)
    }

    return groups
}

/**
 * A signed ELO delta: "+16", "−16" (a true minus sign), "±0", or "–" when the
 * row has no recorded change — rows stored with the schema default
 * '{}'::jsonb, which once rendered "+NaN".
 */
export function formatEloChange(change: number | undefined): string {
    if (change === undefined || Number.isNaN(change)) return '–'
    if (change > 0) return `+${change}`
    if (change < 0) return `\u2212${Math.abs(change)}`
    return '±0'
}

export interface OverviewStats {
    totalMatches: number
    matchesThisWeek: number
    /** Players with a match in the last 30 days. */
    activePlayers: number
    /** The longest current winning streak, if anyone is on one of 2+. */
    hottestStreak: { player: Player; count: number } | null
}

const ACTIVE_WINDOW_DAYS = 30

/** Headline numbers for the overview. Pure: `now` is a parameter. */
export function createOverviewStats(
    players: Player[],
    matches: Match[],
    formByPlayer: Map<string, PlayerForm>,
    now: Date = new Date()
): OverviewStats {
    const today = dayKey(now)
    // Monday-based week, as the office counts it. getUTCDay on the noon-UTC
    // instant of the Oslo day key gives that day's weekday without a zone shift.
    const weekday = (new Date(`${today}T12:00:00Z`).getUTCDay() + 6) % 7
    const activeSince = now.getTime() - ACTIVE_WINDOW_DAYS * 86_400_000

    const matchesThisWeek = matches.filter((match) => {
        const diff = daysBetween(dayKey(match.playedAt), today)
        return diff >= 0 && diff <= weekday
    }).length

    const activePlayers = players.filter(
        (player) => player.lastPlayedAt && new Date(player.lastPlayedAt).getTime() >= activeSince
    ).length

    let hottestStreak: OverviewStats['hottestStreak'] = null
    for (const player of players) {
        const streak = formByPlayer.get(player.id)?.streak
        if (streak?.type === 'win' && streak.count >= 2 && streak.count > (hottestStreak?.count ?? 0)) {
            hottestStreak = { player, count: streak.count }
        }
    }

    return { totalMatches: matches.length, matchesThisWeek, activePlayers, hottestStreak }
}

/**
 * Safely parse integer with fallback
 */
export function parseInteger(value: string, fallback = 0): number {
    const parsed = parseInt(value, 10)
    return isNaN(parsed) ? fallback : parsed
}
