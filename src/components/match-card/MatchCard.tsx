import { Card } from '@fremtind/jokul/card'
import { DescriptionDetail, DescriptionList, DescriptionTerm } from '@fremtind/jokul/description-list'
import { Link } from '@tanstack/react-router'
import type { MatchWithPlayers } from '../../types'
import { formatDate } from '../../utils/gameUtils'

interface MatchCardProps {
    match: MatchWithPlayers
    /**
     * Render from one player's point of view — opponent, win/loss, their score
     * first. Omit for the neutral "A vs B" view.
     */
    currentPlayerId?: string
}

/**
 * A match as a card, in one of two modes.
 *
 * The overview used to hand-roll the neutral variant inline while this file
 * held the player-centric one. They render different things — "who did I play
 * and did I win" versus "who played whom" — but they are one component with
 * one data shape, so they live together rather than drifting apart.
 */
export function MatchCard({ match, currentPlayerId }: MatchCardProps) {
    if (currentPlayerId) {
        return <PlayerCentricMatchCard match={match} currentPlayerId={currentPlayerId} />
    }

    return <NeutralMatchCard match={match} />
}

function PlayerCentricMatchCard({ match, currentPlayerId }: { match: MatchWithPlayers; currentPlayerId: string }) {
    const isPlayer1 = match.player1.id === currentPlayerId
    const opponent = isPlayer1 ? match.player2 : match.player1
    const isWin = match.winner.id === currentPlayerId
    const playerScore = isPlayer1 ? match.player1Score : match.player2Score
    const opponentScore = isPlayer1 ? match.player2Score : match.player1Score

    return (
        <Card variant="low" padding="m">
            <DescriptionList>
                <DescriptionTerm>Motstander</DescriptionTerm>
                <DescriptionDetail>{opponent.name}</DescriptionDetail>
                <DescriptionTerm>Resultat</DescriptionTerm>
                <DescriptionDetail>
                    {isWin ? 'Seier' : 'Tap'} ({playerScore} - {opponentScore})
                </DescriptionDetail>
                <DescriptionTerm>Dato</DescriptionTerm>
                <DescriptionDetail>{formatDate(match.playedAt)}</DescriptionDetail>
            </DescriptionList>
        </Card>
    )
}

function NeutralMatchCard({ match }: { match: MatchWithPlayers }) {
    const isPlayer1Winner = match.winner.id === match.player1.id

    return (
        <Card variant="low" padding="xl">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Link
                            to="/profil/$id"
                            params={{ id: match.player1.id }}
                            className="font-medium text-text-interactive hover:underline"
                        >
                            {match.player1.name}
                        </Link>
                        {isPlayer1Winner && <WinnerTrophy playerName={match.player1.name} />}
                    </div>
                    <span className="text-text-subdued">vs</span>
                    <div className="flex items-center gap-4">
                        <Link
                            to="/profil/$id"
                            params={{ id: match.player2.id }}
                            className="font-medium text-text-interactive hover:underline"
                        >
                            {match.player2.name}
                        </Link>
                        {/* The overview's copy of this lacked the colour on
                            player 2's trophy only; an oversight, not a rule. */}
                        {!isPlayer1Winner && <WinnerTrophy playerName={match.player2.name} />}
                    </div>
                </div>
                <div className="body font-bold">
                    {match.player1Score} - {match.player2Score}
                </div>
            </div>
        </Card>
    )
}

/**
 * The trophy is the only thing marking which player won, so it needs a text
 * alternative rather than being decorative.
 */
function WinnerTrophy({ playerName }: { playerName: string }) {
    return (
        <span role="img" aria-label={`${playerName} vant`} className="text-green-600">
            🏆
        </span>
    )
}
