import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '@fremtind/jokul/table'
import { SuccessTag } from '@fremtind/jokul/tag'
import { useMatches } from '../hooks/useMatches'
import { usePlayers } from '../hooks/usePlayers'
import type { MatchWithPlayers } from '../types'
import { createPlayerMap, resolveMatchPlayers } from '../utils/gameUtils'
import { PlayerLink } from '../components/common/PlayerLink'
import { DateDisplay } from '../components/common/DateDisplay'
import { EmptyState } from '../components/common/EmptyState'
import { QueryState } from '../components/common/QueryState'
import { useElementDimensions } from '@fremtind/jokul/hooks'

const formatEloChange = (change: number | undefined): string => {
    if (change === undefined) {
        return '–'
    }
    return change > 0 ? `+${change}` : `${change}`
}

export function Matches() {
    const matchesQuery = useMatches()
    const playersQuery = usePlayers()
    const matches = matchesQuery.data ?? []
    const players = playersQuery.data ?? []

    // Create a map for quick player lookup
    const playerMap = createPlayerMap(players)

    const [elementRef, dimensions] = useElementDimensions<HTMLTableElement>(350)

    const shouldCollapse = dimensions.width <= 1000

    const matchesWithPlayers: MatchWithPlayers[] = resolveMatchPlayers(matches, playerMap).sort(
        (a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime() // Sort by newest first
    )

    return (
        <QueryState queries={[matchesQuery, playersQuery]}>
            <div ref={elementRef}>
                {matchesWithPlayers.length > 0 && (
                    <div>
                        <h2 className="heading-4 mb-4">Kamper</h2>

                        <Table caption="" fullWidth collapseToList data-collapse={shouldCollapse ? 'true' : undefined}>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Dato</TableHeader>
                                    <TableHeader>Spiller 1</TableHeader>
                                    <TableHeader>Spiller 2</TableHeader>
                                    <TableHeader>Resultat</TableHeader>
                                    <TableHeader>Vinner</TableHeader>
                                    <TableHeader>ELO-endring</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {matchesWithPlayers.map((match) => (
                                    <TableRow key={match.id}>
                                        <TableCell data-th="Dato">
                                            <DateDisplay dateString={match.playedAt} />
                                        </TableCell>
                                        <TableCell data-th="Spiller 1">
                                            <PlayerLink playerId={match.player1.id} playerName={match.player1.name} />
                                        </TableCell>
                                        <TableCell data-th="Spiller 2">
                                            <PlayerLink playerId={match.player2.id} playerName={match.player2.name} />
                                        </TableCell>
                                        <TableCell data-th="Resultat">
                                            {match.player1Score} - {match.player2Score}
                                        </TableCell>
                                        <TableCell data-th="Vinner">
                                            <SuccessTag>{match.winner.name}</SuccessTag>
                                        </TableCell>
                                        <TableCell data-th="ELO-endring">
                                            <div>
                                                <div
                                                    className={`font-bold ${
                                                        (match.eloChanges[match.winner.id] ?? 0) > 0
                                                            ? 'text-background-alert-success'
                                                            : 'text-text-subdued'
                                                    }`}
                                                >
                                                    {match.winner.name}:{' '}
                                                    {formatEloChange(match.eloChanges[match.winner.id])}
                                                </div>
                                                <div
                                                    className={`font-bold ${
                                                        (match.eloChanges[match.loser.id] ?? 0) < 0
                                                            ? 'text-background-alert-error'
                                                            : 'text-text-subdued'
                                                    }`}
                                                >
                                                    {match.loser.name}:{' '}
                                                    {formatEloChange(match.eloChanges[match.loser.id])}
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {matchesWithPlayers.length === 0 && (
                    <EmptyState
                        title="Ingen kamper registrert ennå"
                        description="Start ved å registrere den første kampen"
                        actionText="Registrer første kamp"
                        actionTo="/ny-kamp"
                    />
                )}
            </div>
        </QueryState>
    )
}
