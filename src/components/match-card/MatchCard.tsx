import { Card } from '@fremtind/jokul/card'
import { DescriptionDetail, DescriptionList, DescriptionTerm } from '@fremtind/jokul/description-list'
import type { Match, Player } from '../../types/pong'

interface Props {
    match: Match
    currentPlayerId: string
    players: Player[]
}

export const MatchCard = ({ match, currentPlayerId, players }: Props) => {
    const opponent = players.find(
        (p) => p.id === (match.player1Id === currentPlayerId ? match.player2Id : match.player1Id)
    )
    const isWin = match.winnerId === currentPlayerId
    const playerScore = match.player1Id === currentPlayerId ? match.player1Score : match.player2Score
    const opponentScore = match.player1Id === currentPlayerId ? match.player2Score : match.player1Score

    return (
        <Card variant="low" padding="m">
            <DescriptionList>
                <DescriptionTerm>Motstander</DescriptionTerm>
                <DescriptionDetail>{opponent?.name}</DescriptionDetail>
                <DescriptionTerm>Resultat</DescriptionTerm>
                <DescriptionDetail>
                    {isWin ? 'Seier' : 'Tap'} ({playerScore} - {opponentScore})
                </DescriptionDetail>
                <DescriptionTerm>Dato</DescriptionTerm>
                <DescriptionDetail>{new Date(match.playedAt).toLocaleDateString('no-NO')}</DescriptionDetail>
            </DescriptionList>
        </Card>
    )
}
