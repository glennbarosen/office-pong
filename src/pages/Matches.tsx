import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '@fremtind/jokul/table'
import { SuccessTag } from '@fremtind/jokul/tag'
import { useMatches } from '../hooks/useMatches'
import { usePlayers } from '../hooks/usePlayers'
import type { Match } from '../types/pong'
import { createPlayerMap } from '../utils/gameUtils'
import { PlayerLink } from '../components/common/PlayerLink'
import { DateDisplay } from '../components/common/DateDisplay'
import { EmptyState } from '../components/common/EmptyState'
import { QueryState } from '../components/common/QueryState'
import { useElementDimensions } from '@fremtind/jokul/hooks'

interface MatchWithPlayerNames extends Match {
    player1Name: string
    player2Name: string
    winnerName: string
    loserName: string
    // Undefined for legacy rows stored with the schema default '{}'::jsonb.
    winnerEloChange: number | undefined
    loserEloChange: number | undefined
}

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

    // Enrich matches with player names
    const matchesWithNames: MatchWithPlayerNames[] = matches
        .map((match) => {
            const player1 = playerMap.get(match.player1Id)
            const player2 = playerMap.get(match.player2Id)
            const winner = playerMap.get(match.winnerId)
            const loser = playerMap.get(match.loserId)

            if (!player1 || !player2 || !winner || !loser) {
                return null
            }

            return {
                ...match,
                player1Name: player1.name,
                player2Name: player2.name,
                winnerName: winner.name,
                loserName: loser.name,
                winnerEloChange: match.eloChanges[match.winnerId],
                loserEloChange: match.eloChanges[match.loserId],
            }
        })
        .filter((match): match is MatchWithPlayerNames => match !== null)
        .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()) // Sort by newest first

    return (
        <QueryState queries={[matchesQuery, playersQuery]}>
            <div ref={elementRef}>
                {matchesWithNames.length > 0 && (
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
                                {matchesWithNames.map((match) => (
                                    <TableRow key={match.id}>
                                        <TableCell data-th="Dato">
                                            <DateDisplay dateString={match.playedAt} />
                                        </TableCell>
                                        <TableCell data-th="Spiller 1">
                                            <PlayerLink playerId={match.player1Id} playerName={match.player1Name} />
                                        </TableCell>
                                        <TableCell data-th="Spiller 2">
                                            <PlayerLink playerId={match.player2Id} playerName={match.player2Name} />
                                        </TableCell>
                                        <TableCell data-th="Resultat">
                                            {match.player1Score} - {match.player2Score}
                                        </TableCell>
                                        <TableCell data-th="Vinner">
                                            <SuccessTag>{match.winnerName}</SuccessTag>
                                        </TableCell>
                                        <TableCell data-th="ELO-endring">
                                            <div>
                                                <div
                                                    className={`font-bold ${
                                                        (match.winnerEloChange ?? 0) > 0
                                                            ? 'text-background-alert-success'
                                                            : 'text-text-subdued'
                                                    }`}
                                                >
                                                    {match.winnerName}: {formatEloChange(match.winnerEloChange)}
                                                </div>
                                                <div
                                                    className={`font-bold ${
                                                        (match.loserEloChange ?? 0) < 0
                                                            ? 'text-background-alert-error'
                                                            : 'text-text-subdued'
                                                    }`}
                                                >
                                                    {match.loserName}: {formatEloChange(match.loserEloChange)}
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {matchesWithNames.length === 0 && (
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
