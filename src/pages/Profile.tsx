import { Card } from '@fremtind/jokul/card'
import { ProgressBar } from '@fremtind/jokul/progress-bar'
import { usePlayers } from '../hooks/usePlayers'
import { RATING_CONFIG, type Match, type Player } from '../types/pong'
import { useMatches } from '../hooks/useMatches'
import { MatchCard } from '../components/match-card/MatchCard'
import { PlayerMetrics } from '../components/player-metrics/PlayerMetrics'
import { HeadToHeadTable } from '../components/head-to-head/HeadToHeadTable'
import { FormIndicator } from '../components/leaderboard/FormIndicator'
import { TierBadge } from '../components/leaderboard/TierBadge'
import { PlayerAvatar } from '../components/common/PlayerAvatar'
import { StatGrid, StatTile } from '../components/common/StatTile'
import { QueryState } from '../components/common/QueryState'
import { NotFound } from '../components/common/NotFound'
import { PLAYER_NOT_FOUND } from '../lib/messages'
import {
    createFormByPlayer,
    createLeaderboardEntries,
    createOpponentStats,
    createPlayerMap,
    formatDate,
    resolveMatchPlayers,
} from '../utils/gameUtils'

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
    // Already newest-first: the query orders by played_at DESC.
    const rawPlayerMatches = matches.filter(
        (match: Match) => match.player1Id === player.id || match.player2Id === player.id
    )
    const playerMatches = resolveMatchPlayers(rawPlayerMatches, createPlayerMap(players))
    const opponentStats = createOpponentStats(rawPlayerMatches, player, players)
    const form = createFormByPlayer(rawPlayerMatches).get(player.id)

    // winRate, eligibility and rank are exactly what createLeaderboardEntries
    // derives; recomputing them here is how the definitions drift apart.
    const ranked = createLeaderboardEntries(players).filter((entry) => entry.isEligibleForRanking)
    const rankIndex = ranked.findIndex((entry) => entry.id === player.id)
    const entry = createLeaderboardEntries([player])[0]
    const winRate = entry?.winRate ?? 0
    const isEligibleForRanking = entry?.isEligibleForRanking ?? false

    const minimum = RATING_CONFIG.MINIMUM_MATCHES_FOR_RANKING
    const matchesLeft = Math.max(0, minimum - player.matchesPlayed)

    return (
        <div className="flex flex-col gap-24 sm:gap-32">
            <section aria-labelledby="spiller" className="flex flex-col gap-24">
                <div className="flex flex-col gap-16 sm:flex-row sm:items-center sm:gap-24">
                    <PlayerAvatar player={player} size="xl" />
                    <div className="flex min-w-0 flex-col gap-8">
                        <h1 id="spiller" className="heading-2 truncate">
                            {player.name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-8">
                            {isEligibleForRanking && <TierBadge rating={player.eloRating} />}
                            <span className="small text-text-subdued">Medlem siden {formatDate(player.createdAt)}</span>
                        </div>
                    </div>
                </div>

                <StatGrid className="sm:grid-cols-3 md:grid-cols-5">
                    <StatTile label="ELO" value={player.eloRating} />
                    <StatTile
                        label="Plassering"
                        value={rankIndex >= 0 ? `#${rankIndex + 1}` : '–'}
                        hint={rankIndex >= 0 ? `av ${ranked.length}` : 'Ikke rangert'}
                    />
                    <StatTile
                        label="Kamper"
                        value={player.matchesPlayed}
                        hint={`${player.wins} S · ${player.losses} T`}
                    />
                    <StatTile label="Seiersprosent" value={`${winRate.toFixed(0)} %`} />
                    <StatTile
                        label="Form"
                        value={<FormIndicator form={form} />}
                        hint={form?.streak && form.streak.count >= 2 ? undefined : 'Siste fem kamper'}
                    />
                </StatGrid>

                {!isEligibleForRanking && (
                    <Card variant="outlined" padding="l">
                        <div className="flex flex-col gap-12">
                            <p className="body">
                                <strong>
                                    {matchesLeft} {matchesLeft === 1 ? 'kamp' : 'kamper'} til
                                </strong>{' '}
                                før {player.name.split(' ')[0]} kommer på ledertavla.
                            </p>
                            <ProgressBar
                                title="Kamper mot rangering"
                                aria-valuenow={player.matchesPlayed}
                                aria-valuemax={minimum}
                                aria-valuetext={`${player.matchesPlayed} av ${minimum} kamper`}
                            />
                            <span className="tabular small text-text-subdued">
                                {player.matchesPlayed} av {minimum} kamper
                            </span>
                        </div>
                    </Card>
                )}
            </section>

            <Card variant="outlined" padding="l">
                <h2 className="heading-4 mb-16">Innbyrdes oppgjør</h2>
                <HeadToHeadTable stats={opponentStats} />
            </Card>

            <Card variant="outlined" padding="l">
                <h2 className="heading-4 mb-16">Statistikk</h2>
                {/* Its own filter would redo the one above. */}
                <PlayerMetrics player={player} matches={rawPlayerMatches} players={players} />
            </Card>

            <section aria-labelledby="historikk">
                <h2 id="historikk" className="heading-4 mb-16">
                    Kamphistorikk
                </h2>
                {playerMatches.length > 0 ? (
                    <ul className="m-0 flex list-none flex-col gap-8 p-0">
                        {playerMatches.map((match) => (
                            <li key={match.id}>
                                <MatchCard match={match} currentPlayerId={player.id} />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-text-subdued">Ingen kamper spilt ennå</p>
                )}
            </section>
        </div>
    )
}
