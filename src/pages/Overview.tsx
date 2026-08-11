import { Button } from '@fremtind/jokul/button'
import { usePlayers } from '../hooks/usePlayers'
import { useMatches } from '../hooks/useMatches'
import { Link } from '@tanstack/react-router'
import { createLeaderboardEntries, createPlayerMap, resolveMatchPlayers } from '../utils/gameUtils'
import { QueryState } from '../components/common/QueryState'
import { EmptyState } from '../components/common/EmptyState'
import { NO_PLAYERS_EMPTY_STATE } from '../lib/messages'
import { LeaderboardCard } from '../components/leaderboard/LeaderboardCard'
import { MatchCard } from '../components/match-card/MatchCard'

/** The overview is a digest: the leading few players and the newest few matches. */
const OVERVIEW_LIMIT = 5

export function Overview() {
    const playersQuery = usePlayers()
    const matchesQuery = useMatches()
    const players = playersQuery.data ?? []
    const matches = matchesQuery.data ?? []

    const playerMap = createPlayerMap(players)

    const leaderboardData = createLeaderboardEntries(players)

    // Already ordered newest-first by the query.
    const recentMatches = resolveMatchPlayers(matches, playerMap).slice(0, OVERVIEW_LIMIT)

    return (
        <QueryState queries={[playersQuery, matchesQuery]}>
            {/* The front page shows sections rather than a titled document, so
                its heading is for screen readers and the document outline. */}
            <h1 className="sr-only">Oversikt</h1>
            <div className="flex justify-end">
                <Button as={Link} to="/ny-kamp" variant="primary">
                    Ny kamp
                </Button>
            </div>
            <div className="flex flex-col gap-12">
                <h2 className="heading-4">Topp {OVERVIEW_LIMIT}</h2>
                {leaderboardData.slice(0, OVERVIEW_LIMIT).map((player, index) => (
                    <LeaderboardCard key={player.id} player={player} rank={index + 1} />
                ))}
                <div className="flex justify-center">
                    <Button as={Link} to="/ledertavle" variant="secondary">
                        Se alle
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-12">
                <h2 className="heading-4">Siste {OVERVIEW_LIMIT} kamper</h2>
                {recentMatches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                ))}
                <div className="flex justify-center">
                    <Button as={Link} to="/kamper" variant="secondary">
                        Se alle
                    </Button>
                </div>
            </div>

            {players.length === 0 && <EmptyState {...NO_PLAYERS_EMPTY_STATE} />}
        </QueryState>
    )
}
