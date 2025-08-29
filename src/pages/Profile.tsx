import { Card, Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '@fremtind/jokul'
import { usePlayers } from '../hooks/usePlayers'
import { RATING_CONFIG, type Match } from '../types/pong'
import { useMatches } from '../hooks/useMatches'

interface ProfileProps {
    id: string
}

export function Profile({ id }: ProfileProps) {
    const { data: players = [] } = usePlayers()
    const { data: matches = [] } = useMatches()

    const player = players.find((p) => p.id === id)

    if (!player) {
        return (
            <div className="py-6 mx-auto max-w-md px-4">
                <Card className="p-6 text-center">
                    <h1 className="text-xl mb-2 font-bold">Spiller ikke funnet</h1>
                    <p className="text-gray-600">Spilleren du leter etter finnes ikke.</p>
                </Card>
            </div>
        )
    }

    // Get player's matches
    const playerMatches = matches
        .filter((match: Match) => match.player1Id === id || match.player2Id === id)
        .sort((a: Match, b: Match) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime())

    const winRate = player.matchesPlayed > 0 ? (player.wins / player.matchesPlayed) * 100 : 0
    const isEligibleForRanking = player.matchesPlayed >= RATING_CONFIG.MINIMUM_MATCHES_FOR_RANKING

    // Calculate recent form (last 5 matches)
    const recentMatches = playerMatches.slice(0, 5)
    const recentForm = recentMatches.map((match: Match) => (match.winnerId === id ? 'W' : 'L'))

    return (
        <div className="py-6 mx-auto max-w-2xl px-4">
            <div className="mb-6 text-center">
                <h1 className="text-2xl mb-2 font-bold">{player.name}</h1>
                <div className="text-sm text-gray-600 flex items-center justify-center gap-4">
                    <span>Medlem siden {new Date(player.createdAt).toLocaleDateString('no-NO')}</span>
                </div>
            </div>

            {/* Stats Overview */}
            <Card className="p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Statistikk</h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="text-center">
                        <div className="text-2xl text-blue-600 font-bold">{player.eloRating}</div>
                        <div className="text-sm text-gray-600">ELO Rating</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl text-green-600 font-bold">{player.wins}</div>
                        <div className="text-sm text-gray-600">Seire</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl text-red-600 font-bold">{player.losses}</div>
                        <div className="text-sm text-gray-600">Tap</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">{winRate.toFixed(0)}%</div>
                        <div className="text-sm text-gray-600">Seiersprosent</div>
                    </div>
                </div>

                {!isEligibleForRanking && (
                    <div className="p-3 bg-yellow-50 mt-4 rounded-lg">
                        <p className="text-sm text-yellow-800">
                            Spill {RATING_CONFIG.MINIMUM_MATCHES_FOR_RANKING - player.matchesPlayed} kamper til for å
                            komme på ranglisten
                        </p>
                    </div>
                )}

                {recentForm.length > 0 && (
                    <div className="mt-4">
                        <h3 className="text-sm font-medium mb-2">Siste form:</h3>
                        <div className="gap-1 flex">
                            {recentForm.map((result: string, index: number) => (
                                <span
                                    key={index}
                                    className={`w-6 h-6 text-xs text-white flex items-center justify-center rounded-full font-bold ${
                                        result === 'W' ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                                >
                                    {result}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </Card>

            {/* Match History */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Kamphistorikk</h2>
                {playerMatches.length > 0 ? (
                    <Table caption="Spillerens kamphistorikk">
                        <TableHead>
                            <TableRow>
                                <TableHeader>Motspiller</TableHeader>
                                <TableHeader>Resultat</TableHeader>
                                <TableHeader>Poeng</TableHeader>
                                <TableHeader>Dato</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {playerMatches.map((match: Match) => {
                                const opponent = players.find(
                                    (p) => p.id === (match.player1Id === id ? match.player2Id : match.player1Id)
                                )
                                const isWin = match.winnerId === id
                                const playerScore = match.player1Id === id ? match.player1Score : match.player2Score
                                const opponentScore = match.player1Id === id ? match.player2Score : match.player1Score

                                return (
                                    <TableRow key={match.id}>
                                        <TableCell>
                                            <div className="font-medium">{opponent?.name || 'Ukjent spiller'}</div>
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`font-medium ${isWin ? 'text-green-600' : 'text-red-600'}`}
                                            >
                                                {isWin ? 'Seier' : 'Tap'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono">
                                                {playerScore}-{opponentScore}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-gray-600">
                                                {new Date(match.playedAt).toLocaleDateString('no-NO')}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="py-8 text-center">
                        <p className="text-gray-500">Ingen kamper spilt ennå</p>
                    </div>
                )}
            </Card>
        </div>
    )
}
