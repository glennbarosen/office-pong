import type { Player, Match } from '../../types/pong'

export interface PlayerMetricsProps {
    player: Player
    matches: Match[]
    players: Player[]
}

export interface OpponentStats {
    opponentId: string
    opponentName: string
    wins: number
    losses: number
    winRate: number
    totalMatches: number
    averageScore: number
    eloChange: number
}

export interface EloHistoryPoint {
    matchNumber: number
    elo: number
    date: string
    dateFormatted: string
    opponent: string
    result: 'Win' | 'Loss'
}

export interface ChartColors {
    primary: string
    success: string
    danger: string
    warning: string
    info: string
    grid: string
    text: string
    line: string
}
