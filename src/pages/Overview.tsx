import { Button } from '@fremtind/jokul/button'
import { Card } from '@fremtind/jokul/card'
import { Link } from '@tanstack/react-router'
import { usePlayers } from '../hooks/usePlayers'
import { useMatches } from '../hooks/useMatches'
import {
    createFormByPlayer,
    createLeaderboardEntries,
    createOverviewStats,
    createPlayerMap,
    resolveMatchPlayers,
} from '../utils/gameUtils'
import { RATING_CONFIG, type LeaderboardEntry, type PlayerForm } from '../types/pong'
import { QueryState } from '../components/common/QueryState'
import { EmptyState } from '../components/common/EmptyState'
import { NO_PLAYERS_EMPTY_STATE } from '../lib/messages'
import { LeaderboardCard } from '../components/leaderboard/LeaderboardCard'
import { MatchCard } from '../components/match-card/MatchCard'
import { PlayerAvatar } from '../components/common/PlayerAvatar'
import { TierBadge } from '../components/leaderboard/TierBadge'
import { FormIndicator } from '../components/leaderboard/FormIndicator'
import { StatGrid, StatTile } from '../components/common/StatTile'
import { SectionHeader } from '../components/layout/SectionHeader'

/** The overview is a digest: the leading few players and the newest few matches. */
const OVERVIEW_LIMIT = 5

export function Overview() {
    const playersQuery = usePlayers()
    const matchesQuery = useMatches()
    const players = playersQuery.data ?? []
    const matches = matchesQuery.data ?? []

    const ranked = createLeaderboardEntries(players).filter((entry) => entry.isEligibleForRanking)
    const formByPlayer = createFormByPlayer(matches)
    const stats = createOverviewStats(players, matches, formByPlayer)

    // Already ordered newest-first by the query.
    const recentMatches = resolveMatchPlayers(matches, createPlayerMap(players)).slice(0, OVERVIEW_LIMIT)
    const champion = ranked[0]

    return (
        <QueryState queries={[playersQuery, matchesQuery]}>
            {/* The front page shows sections rather than a titled document, so
                its heading is for screen readers and the document outline. */}
            <h1 className="sr-only">Oversikt</h1>

            {players.length === 0 ? (
                <EmptyState {...NO_PLAYERS_EMPTY_STATE} />
            ) : (
                <div className="flex flex-col gap-40 sm:gap-64">
                    <section aria-label="Status" className="grid gap-12 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                        {champion ? (
                            <ChampionCard player={champion} form={formByPlayer.get(champion.id)} />
                        ) : (
                            <NoChampionCard />
                        )}
                        <StatGrid>
                            <StatTile label="Kamper totalt" value={stats.totalMatches} />
                            <StatTile label="Denne uken" value={stats.matchesThisWeek} />
                            <StatTile label="Aktive spillere" value={stats.activePlayers} hint="Siste 30 dager" />
                            <StatTile
                                label="Lengste rekke"
                                value={stats.hottestStreak ? `${stats.hottestStreak.count} seire` : '–'}
                                hint={stats.hottestStreak?.player.name ?? 'Ingen på rekke nå'}
                            />
                        </StatGrid>
                    </section>

                    <div className="grid gap-40 md:grid-cols-2 md:gap-32">
                        <section aria-labelledby="topp">
                            <SectionHeader id="topp" title={`Topp ${OVERVIEW_LIMIT}`} linkTo="/ledertavle" />
                            {ranked.length > 0 ? (
                                <ol className="m-0 flex list-none flex-col gap-8 p-0">
                                    {ranked.slice(0, OVERVIEW_LIMIT).map((player, index) => (
                                        <li key={player.id}>
                                            <LeaderboardCard
                                                player={player}
                                                rank={index + 1}
                                                form={formByPlayer.get(player.id)}
                                            />
                                        </li>
                                    ))}
                                </ol>
                            ) : (
                                <p className="text-text-subdued">Ingen er rangert ennå.</p>
                            )}
                        </section>

                        <section aria-labelledby="siste">
                            <SectionHeader id="siste" title="Siste kamper" linkTo="/kamper" />
                            {recentMatches.length > 0 ? (
                                <ul className="m-0 flex list-none flex-col gap-8 p-0">
                                    {recentMatches.map((match) => (
                                        <li key={match.id}>
                                            <MatchCard match={match} />
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-text-subdued">Ingen kamper ennå.</p>
                            )}
                        </section>
                    </div>
                </div>
            )}
        </QueryState>
    )
}

function ChampionCard({ player, form }: { player: LeaderboardEntry; form: PlayerForm | undefined }) {
    return (
        <Card variant="high" padding="l" clickable asChild className="lift">
            <Link
                to="/profil/$id"
                params={{ id: player.id }}
                className="flex flex-wrap items-center gap-16 no-underline sm:flex-nowrap sm:gap-24"
            >
                <PlayerAvatar player={player} size="lg" />
                <div className="flex min-w-0 flex-1 flex-col gap-8">
                    <span className="small font-bold uppercase tracking-wider text-text-subdued">Kontorets mester</span>
                    <span className="heading-2 truncate">{player.name}</span>
                    <div className="flex flex-wrap items-center gap-8">
                        <TierBadge rating={player.eloRating} />
                        <FormIndicator form={form} />
                    </div>
                </div>
                <div className="flex items-baseline gap-8 sm:block sm:text-right">
                    <div className="tabular heading-1">{player.eloRating}</div>
                    <div className="small text-text-subdued">ELO</div>
                </div>
            </Link>
        </Card>
    )
}

function NoChampionCard() {
    return (
        <Card variant="high" padding="l" className="flex flex-col justify-center gap-16">
            <span className="small font-bold uppercase tracking-wider text-text-subdued">Kontorets mester</span>
            <p className="heading-3">Tronen står tom</p>
            <p className="text-text-subdued">
                Første spiller med {RATING_CONFIG.MINIMUM_MATCHES_FOR_RANKING} kamper tar plassen.
            </p>
            <div>
                <Button as={Link} to="/ny-kamp" variant="primary">
                    Registrer kamp
                </Button>
            </div>
        </Card>
    )
}
