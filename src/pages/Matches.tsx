import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell, Button, Tag } from '@fremtind/jokul'
import { useMatches } from '../hooks/useMatches'
import { usePlayers } from '../hooks/usePlayers'
import { Link } from '@tanstack/react-router'
import type { Match, Player } from '../types/pong'

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
    const playerMap = new Map<string, Player>()
    players.forEach((player) => {
        playerMap.set(player.id, player)
    })

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
        return (
            <div className="flex min-h-64 items-center justify-center">
                <div>Laster...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="heading-3">Alle kamper</h1>
                <div className="gap-3 flex">
                    <Button as={Link} to="/ledertavle" variant="secondary">
                        Se ledertavle
                    </Button>
                    <Button as={Link} to="/ny-kamp" variant="primary">
                        Ny kamp
                    </Button>
                </div>
            </div>

            {matchesWithNames.length > 0 && (
                <div>
                    <p className="small mb-4 text-text-subdued">
                        Viser {matchesWithNames.length} kamp{matchesWithNames.length !== 1 ? 'er' : ''}, sortert etter
                        dato (nyeste først)
                    </p>
                    <Table caption="Oversikt over alle kamper">
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
                                        <div className="text-sm">
                                            <div>
                                                {new Date(match.playedAt).toLocaleDateString('no-NO', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </div>
                                            <div className="text-xs text-text-subdued">
                                                {new Date(match.playedAt).toLocaleTimeString('no-NO', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            as={Link}
                                            to="/profil/$id"
                                            params={{ id: match.player1Id }}
                                            variant="ghost"
                                            className="font-medium p-0"
                                        >
                                            {match.player1Name}
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            as={Link}
                                            to="/profil/$id"
                                            params={{ id: match.player2Id }}
                                            variant="ghost"
                                            className="font-medium p-0"
                                        >
                                            {match.player2Name}
                                        </Button>
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
                <div className="py-12 text-center">
                    <p className="mb-4 text-text-subdued">Ingen kamper registrert ennå</p>
                    <p className="small text-text-subdued">Start ved å registrere den første kampen</p>
                    <div className="mt-6">
                        <Button as={Link} to="/ny-kamp" variant="primary">
                            Registrer første kamp
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
