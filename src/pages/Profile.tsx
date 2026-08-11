import { DescriptionList, DescriptionTerm, DescriptionDetail } from '@fremtind/jokul/description-list'
import { Card } from '@fremtind/jokul/card'
import { usePlayers } from '../hooks/usePlayers'
import { RATING_CONFIG, type Match, type Player } from '../types/pong'
import { useMatches } from '../hooks/useMatches'
import { MatchCard } from '../components/match-card/MatchCard'
import { PlayerMetrics } from '../components/player-metrics/PlayerMetrics'
import { InfoMessage } from '@fremtind/jokul/message'
import { QueryState } from '../components/common/QueryState'
import { NotFound } from '../components/common/NotFound'
import { PLAYER_NOT_FOUND } from '../lib/messages'
import { createPlayerMap, resolveMatchPlayers } from '../utils/gameUtils'

interface ProfileProps {
    id: string
}

export function Profile({ id }: ProfileProps) {
    const playersQuery = usePlayers()
    const matchesQuery = useMatches()
    const players = playersQuery.data ?? []
    const matches = matchesQuery.data ?? []

    const player = players.find((p) => p.id === id)

    // The !player branch must sit inside QueryState, not before it: both queries
    // default to [], so while they are pending an absent player is
    // indistinguishable from one that does not exist. Checking first is what
    // made every profile visit flash "Spiller ikke funnet".
    //
    // The route loader throws notFound() for an unknown id, so the miss below
    // is only reachable in edge cases — a player deleted while the page is open.
    return (
        <QueryState queries={[playersQuery, matchesQuery]}>
            {player ? (
                <ProfileDetails player={player} players={players} matches={matches} />
            ) : (
                <NotFound title={PLAYER_NOT_FOUND.title} description={PLAYER_NOT_FOUND.description} />
            )}
        </QueryState>
    )
}

interface ProfileDetailsProps {
    player: Player
    players: Player[]
    matches: Match[]
}

function ProfileDetails({ player, players, matches }: ProfileDetailsProps) {
    const playerMatches = resolveMatchPlayers(
        matches.filter((match: Match) => match.player1Id === player.id || match.player2Id === player.id),
        createPlayerMap(players)
    ).sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime())

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

            {/* Player Metrics Charts */}
            <div className="p-6">
                <h2 className="heading-4 mb-4">Detaljert statistikk</h2>
                <PlayerMetrics player={player} matches={matches} players={players} />
            </div>

            <div className="p-6">
                <h2 className="heading-4 mb-4">Kamphistorikk</h2>
                {playerMatches.length > 0 ? (
                    <div className="space-y-4">
                        {playerMatches.map((match) => (
                            <MatchCard key={match.id} match={match} currentPlayerId={player.id} />
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
