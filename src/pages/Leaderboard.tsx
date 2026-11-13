import { usePlayers } from '../hooks/usePlayers'
import { useMatches } from '../hooks/useMatches'
import { createFormByPlayer, createLeaderboardEntries } from '../utils/gameUtils'
import { RATING_CONFIG } from '../types/pong'
import { EmptyState } from '../components/common/EmptyState'
import { NO_PLAYERS_EMPTY_STATE } from '../lib/messages'
import { QueryState } from '../components/common/QueryState'
import { PageHeader } from '../components/layout/PageHeader'
import { SectionHeader } from '../components/layout/SectionHeader'
import { LeaderboardCard } from '../components/leaderboard/LeaderboardCard'
import { Podium } from '../components/leaderboard/Podium'

const PODIUM_SIZE = 3

export function Leaderboard() {
    const playersQuery = usePlayers()
    const matchesQuery = useMatches()
    const players = playersQuery.data ?? []
    const matches = matchesQuery.data ?? []

    // Eligible first, then by rating — so ranked players are a prefix.
    const entries = createLeaderboardEntries(players)
    const ranked = entries.filter((entry) => entry.isEligibleForRanking)
    const unranked = entries.filter((entry) => !entry.isEligibleForRanking)
    const formByPlayer = createFormByPlayer(matches)

    return (
        <QueryState queries={[playersQuery, matchesQuery]}>
            <PageHeader
                title="Ledertavle"
                subtitle={`Rangert etter ELO. Spill ${RATING_CONFIG.MINIMUM_MATCHES_FOR_RANKING} kamper for å komme på tavla.`}
            />

            {players.length === 0 ? (
                <EmptyState {...NO_PLAYERS_EMPTY_STATE} />
            ) : (
                <div className="flex flex-col gap-40">
                    {ranked.length > 0 ? (
                        <>
                            <Podium players={ranked} formByPlayer={formByPlayer} />
                            {ranked.length > PODIUM_SIZE && (
                                <ol aria-label="Resten av tavla" className="m-0 flex list-none flex-col gap-8 p-0">
                                    {ranked.slice(PODIUM_SIZE).map((player, index) => (
                                        <li key={player.id}>
                                            <LeaderboardCard
                                                player={player}
                                                rank={index + PODIUM_SIZE + 1}
                                                form={formByPlayer.get(player.id)}
                                            />
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </>
                    ) : (
                        <EmptyState
                            title="Ingen er rangert ennå"
                            description={`Første spiller med ${RATING_CONFIG.MINIMUM_MATCHES_FOR_RANKING} kamper tar plassen på toppen.`}
                        />
                    )}

                    {unranked.length > 0 && (
                        <section aria-labelledby="ikke-rangert">
                            <SectionHeader id="ikke-rangert" title="Ikke rangert ennå" />
                            <ul className="m-0 flex list-none flex-col gap-8 p-0">
                                {unranked.map((player) => (
                                    <li key={player.id}>
                                        <LeaderboardCard player={player} form={formByPlayer.get(player.id)} />
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>
            )}
        </QueryState>
    )
}
