import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '@fremtind/jokul/table'
import { Tag } from '@fremtind/jokul/tag'
import { useMatches } from '../hooks/useMatches'
import { usePlayers } from '../hooks/usePlayers'
import type { Match } from '../types/pong'
import { createPlayerMap } from '../utils/gameUtils'
import { PlayerLink } from '../components/common/PlayerLink'
import { DateDisplay } from '../components/common/DateDisplay'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { EmptyState } from '../components/common/EmptyState'

interface MatchWithPlayerNames extends Match {
    player1Name: string
    player2Name: string
    winnerName: string
    loserName: string
}

export function Matches() {
    const { data: matches = [], isLoading: isLoadingMatches } = useMatches()
    const { data: players = [], isLoading: isLoadingPlayers } = usePlayers()

    // Create a map for quick player lookup
    const playerMap = createPlayerMap(players)

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
            }
        })
        .filter((match): match is MatchWithPlayerNames => match !== null)
        .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()) // Sort by newest first

    const isLoading = isLoadingMatches || isLoadingPlayers

    if (isLoading) {
        return <LoadingSpinner />
    }

    return (
        <>
            {matchesWithNames.length > 0 && (
                <div>
                    <p className="small mb-4 text-text-subdued">
                        Viser {matchesWithNames.length} kamp{matchesWithNames.length !== 1 ? 'er' : ''}, sortert etter
                        dato (nyeste først)
                    </p>
                    <Table caption="Oversikt over alle kamper" fullWidth>
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
                                    <TableCell>
                                        <DateDisplay dateString={match.playedAt} includeTime />
                                    </TableCell>
                                    <TableCell>
                                        <PlayerLink playerId={match.player1Id} playerName={match.player1Name} />
                                    </TableCell>
                                    <TableCell>
                                        <PlayerLink playerId={match.player2Id} playerName={match.player2Name} />
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-mono">
                                            {match.player1Score} - {match.player2Score}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Tag>{match.winnerName}</Tag>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <div
                                                className={`font-mono ${
                                                    match.eloChanges[match.winnerId] > 0
                                                        ? 'text-green-600'
                                                        : 'text-text-subdued'
                                                }`}
                                            >
                                                {match.winnerName}: +{Math.abs(match.eloChanges[match.winnerId])}
                                            </div>
                                            <div
                                                className={`font-mono ${
                                                    match.eloChanges[match.loserId] < 0
                                                        ? 'text-red-600'
                                                        : 'text-text-subdued'
                                                }`}
                                            >
                                                {match.loserName}: {match.eloChanges[match.loserId]}
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
        </>
    )
}
