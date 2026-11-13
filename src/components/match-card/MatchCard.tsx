import type { CSSProperties } from 'react'
import { Card } from '@fremtind/jokul/card'
import { Link } from '@tanstack/react-router'
import type { MatchWithPlayers, Player } from '../../types'
import { formatDate, formatEloChange, formatTime } from '../../utils/gameUtils'
import { PlayerAvatar } from '../common/PlayerAvatar'

interface MatchCardProps {
    match: MatchWithPlayers
    /**
     * Render from one player's point of view — opponent, win/loss, their score
     * first. Omit for the neutral "A vs B" scoreboard.
     */
    currentPlayerId?: string
    /** Show the date as well as the time; off when the caller already groups by day. */
    showDate?: boolean
    /** Name of the tournament the match belongs to, shown as a tag. */
    tournamentName?: string
}

/**
 * A match as a card, in one of two modes: a neutral scoreboard ("who played
 * whom") or one player's history row ("who did I play and did I win"). One
 * component with one data shape, so the two do not drift apart.
 */
export function MatchCard({ match, currentPlayerId, showDate = true, tournamentName }: MatchCardProps) {
    if (currentPlayerId) {
        return <PlayerCentricMatchCard match={match} currentPlayerId={currentPlayerId} />
    }

    return <NeutralMatchCard match={match} showDate={showDate} tournamentName={tournamentName} />
}

function deltaClass(change: number | undefined): string {
    if (change === undefined || change === 0) return 'text-text-subdued'
    return change > 0 ? 'text-delta-up' : 'text-delta-down'
}

function PlayerCentricMatchCard({ match, currentPlayerId }: { match: MatchWithPlayers; currentPlayerId: string }) {
    const isPlayer1 = match.player1.id === currentPlayerId
    const opponent = isPlayer1 ? match.player2 : match.player1
    const isWin = match.winner.id === currentPlayerId
    const playerScore = isPlayer1 ? match.player1Score : match.player2Score
    const opponentScore = isPlayer1 ? match.player2Score : match.player1Score
    const change = match.eloChanges[currentPlayerId]

    return (
        <Card
            variant="low"
            padding="m"
            className="accent-edge"
            style={{ '--accent-color': isWin ? 'var(--delta-up)' : 'var(--delta-down)' } as CSSProperties}
        >
            <div className="flex items-center gap-12">
                <span className={`small w-40 shrink-0 font-bold ${isWin ? 'text-delta-up' : 'text-delta-down'}`}>
                    {isWin ? 'Seier' : 'Tap'}
                </span>
                <PlayerAvatar player={opponent} />
                <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate">
                        <span className="text-text-subdued">mot </span>
                        <Link
                            to="/profil/$id"
                            params={{ id: opponent.id }}
                            className="font-bold text-text-default underline-offset-4 hover:underline"
                        >
                            {opponent.name}
                        </Link>
                    </span>
                    <span className="small text-text-subdued">{formatDate(match.playedAt)}</span>
                </div>
                <div className="flex shrink-0 flex-col items-end">
                    <span className="tabular body font-bold">
                        {playerScore}–{opponentScore}
                    </span>
                    <span className={`tabular small ${deltaClass(change)}`}>
                        {formatEloChange(change)}
                        <span className="sr-only"> ELO</span>
                    </span>
                </div>
            </div>
        </Card>
    )
}

function NeutralMatchCard({
    match,
    showDate,
    tournamentName,
}: {
    match: MatchWithPlayers
    showDate: boolean
    tournamentName?: string
}) {
    const isPlayer1Winner = match.winner.id === match.player1.id

    return (
        <Card variant="low" padding="m">
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-12 sm:gap-24">
                <ScoreboardSide
                    player={match.player1}
                    isWinner={isPlayer1Winner}
                    change={match.eloChanges[match.player1.id]}
                    align="left"
                />

                <div className="flex flex-col items-center">
                    <span className="tabular heading-3 whitespace-nowrap">
                        <span className={isPlayer1Winner ? '' : 'text-text-subdued'}>{match.player1Score}</span>
                        <span className="px-4 text-text-subdued" aria-hidden="true">
                            –
                        </span>
                        <span className="sr-only"> mot </span>
                        <span className={isPlayer1Winner ? 'text-text-subdued' : ''}>{match.player2Score}</span>
                    </span>
                    <time dateTime={match.playedAt} className="tabular small text-text-subdued">
                        {showDate ? formatDate(match.playedAt, { includeTime: true }) : formatTime(match.playedAt)}
                    </time>
                    {tournamentName && (
                        <span className="small mt-4 inline-flex items-center gap-4 font-bold text-text-subdued">
                            <span aria-hidden="true">🏆</span>
                            {tournamentName}
                        </span>
                    )}
                </div>

                <ScoreboardSide
                    player={match.player2}
                    isWinner={!isPlayer1Winner}
                    change={match.eloChanges[match.player2.id]}
                    align="right"
                />
            </div>
        </Card>
    )
}

interface ScoreboardSideProps {
    player: Player
    isWinner: boolean
    change: number | undefined
    align: 'left' | 'right'
}

/**
 * One player's half of the scoreboard. The winner is marked by weight and a
 * screen-reader "vant", never by colour alone.
 */
function ScoreboardSide({ player, isWinner, change, align }: ScoreboardSideProps) {
    const isRight = align === 'right'

    return (
        <div className={`flex min-w-0 items-center gap-8 sm:gap-12 ${isRight ? 'flex-row-reverse text-right' : ''}`}>
            <span className="hidden sm:inline-flex">
                <PlayerAvatar player={player} size="md" />
            </span>
            <div className={`flex min-w-0 flex-col ${isRight ? 'items-end' : 'items-start'}`}>
                <Link
                    to="/profil/$id"
                    params={{ id: player.id }}
                    className={`max-w-full truncate underline-offset-4 hover:underline ${
                        isWinner ? 'font-bold text-text-default' : 'text-text-subdued'
                    }`}
                >
                    {player.name}
                </Link>
                {isWinner && <span className="sr-only">vant</span>}
                <span className={`tabular small ${deltaClass(change)}`}>
                    {formatEloChange(change)}
                    <span className="sr-only"> ELO</span>
                </span>
            </div>
        </div>
    )
}
