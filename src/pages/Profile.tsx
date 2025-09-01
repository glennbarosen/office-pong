import { DescriptionList, DescriptionTerm, DescriptionDetail } from '@fremtind/jokul/description-list'
import { Card } from '@fremtind/jokul/card'
import { usePlayers } from '../hooks/usePlayers'
import { RATING_CONFIG, type Match } from '../types/pong'
import { useMatches } from '../hooks/useMatches'
import { MatchCard } from '../components/match-card/MatchCard'
import { InfoMessage } from '@fremtind/jokul/message'

interface ProfileProps {
    id: string
}

export function Profile({ id }: ProfileProps) {
    const { data: players = [] } = usePlayers()
    const { data: matches = [] } = useMatches()

    const player = players.find((p) => p.id === id)

    if (!player) {
        return (
            <div className="py-6 mx-auto max-w-md px-4">
                <div className="p-6 text-center">
                    <h1 className="heading-3 mb-2">Spiller ikke funnet</h1>
                    <p className="text-text-subdued">Spilleren du leter etter finnes ikke.</p>
                </div>
            </div>
        )
    }

    // Get player's matches
    const playerMatches = matches
        .filter((match: Match) => match.player1Id === id || match.player2Id === id)
        .sort((a: Match, b: Match) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime())

    const winRate = player.matchesPlayed > 0 ? (player.wins / player.matchesPlayed) * 100 : 0
    const isEligibleForRanking = player.matchesPlayed >= RATING_CONFIG.MINIMUM_MATCHES_FOR_RANKING

    return (
        <div className="flex flex-col gap-32">
            <Card variant="outlined" className="max-w-[400px] space-y-24">
                <div>
                    <h1 className="heading-2">{player.name}</h1>
                    <div className="text-text-subdued">
                        Medlem siden {new Date(player.createdAt).toLocaleDateString('no-NO')}
                    </div>
                </div>

                <DescriptionList>
                    <DescriptionTerm>ELO Rating</DescriptionTerm>
                    <DescriptionDetail>{player.eloRating}</DescriptionDetail>
                    <DescriptionTerm>Antall kamper</DescriptionTerm>
                    <DescriptionDetail>{player.wins + player.losses}</DescriptionDetail>
                    <DescriptionTerm>Seire</DescriptionTerm>
                    <DescriptionDetail>{player.wins}</DescriptionDetail>
                    <DescriptionTerm>Tap</DescriptionTerm>
                    <DescriptionDetail>{player.losses}</DescriptionDetail>
                    <DescriptionTerm>Seiersprosent</DescriptionTerm>
                    <DescriptionDetail>{winRate.toFixed(0)}%</DescriptionDetail>
                </DescriptionList>

                {!isEligibleForRanking && (
                    <InfoMessage title="Ikke kvalifisert for ledetavlen" className="mt-24">
                        Spill {RATING_CONFIG.MINIMUM_MATCHES_FOR_RANKING - player.matchesPlayed} kamper til for å komme
                        på ledetavlen
                    </InfoMessage>
                )}
            </Card>

            <div className="p-6">
                <h2 className="heading-4 mb-4">Kamphistorikk</h2>
                {playerMatches.length > 0 ? (
                    <div className="space-y-4">
                        {playerMatches.map((match) => (
                            <MatchCard key={match.id} match={match} currentPlayerId={id} players={players} />
                        ))}
                    </div>
                ) : (
                    <div className="py-8 text-center">
                        <p className="text-text-subdued">Ingen kamper spilt ennå</p>
                    </div>
                )}
            </div>
        </div>
    )
}
