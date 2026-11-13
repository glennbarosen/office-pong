import { useMatches } from '../hooks/useMatches'
import { usePlayers } from '../hooks/usePlayers'
import { createPlayerMap, groupMatchesByDay, resolveMatchPlayers } from '../utils/gameUtils'
import { MatchCard } from '../components/match-card/MatchCard'
import { EmptyState } from '../components/common/EmptyState'
import { QueryState } from '../components/common/QueryState'
import { PageHeader } from '../components/layout/PageHeader'

export function Matches() {
    const matchesQuery = useMatches()
    const playersQuery = usePlayers()
    const matches = matchesQuery.data ?? []
    const players = playersQuery.data ?? []

    // No client-side sort: the query already returns ORDER BY played_at DESC.
    const matchesWithPlayers = resolveMatchPlayers(matches, createPlayerMap(players))
    const days = groupMatchesByDay(matchesWithPlayers)

    return (
        <QueryState queries={[matchesQuery, playersQuery]}>
            <PageHeader
                title="Kamper"
                subtitle={
                    matchesWithPlayers.length > 0
                        ? `${matchesWithPlayers.length} ${matchesWithPlayers.length === 1 ? 'kamp' : 'kamper'} registrert`
                        : undefined
                }
            />

            {days.length > 0 ? (
                <div className="flex flex-col gap-32">
                    {days.map((day) => (
                        <section key={day.key} aria-labelledby={`dag-${day.key}`}>
                            <h2
                                id={`dag-${day.key}`}
                                className="small mb-12 font-bold uppercase tracking-wider text-text-subdued"
                            >
                                {day.label}
                            </h2>
                            <ul className="m-0 flex list-none flex-col gap-8 p-0">
                                {day.matches.map((match) => (
                                    <li key={match.id}>
                                        <MatchCard match={match} showDate={false} />
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            ) : (
                <EmptyState
                    title="Ingen kamper registrert ennå"
                    description="Start ved å registrere den første kampen"
                    actionText="Registrer første kamp"
                    actionTo="/ny-kamp"
                />
            )}
        </QueryState>
    )
}
