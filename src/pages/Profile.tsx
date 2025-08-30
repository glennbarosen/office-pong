import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '@fremtind/jokul'
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
                <div className="p-6 text-center">
                    <h1 className="heading-3 mb-2">Spiller ikke funnet</h1>
                    <p className="text-text-subdued">Spilleren du leter etter finnes ikke.</p>
                </div>
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
                <h1 className="heading-2 mb-2">{player.name}</h1>
                <div className="small flex items-center justify-center gap-4 text-text-subdued">
                    <span>Medlem siden {new Date(player.createdAt).toLocaleDateString('no-NO')}</span>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="p-6 mb-6">
                <h2 className="heading-4 mb-4">Statistikk</h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="text-center">
                        <div className="heading-3 text-text-interactive">{player.eloRating}</div>
                        <div className="small text-text-subdued">ELO Rating</div>
                    </div>
                    <div className="text-center">
                        <div className="heading-3 text-text-interactive">{player.wins}</div>
                        <div className="small text-text-subdued">Seire</div>
                    </div>
                    <div className="text-center">
                        <div className="heading-3 text-text-interactive">{player.losses}</div>
                        <div className="small text-text-subdued">Tap</div>
                    </div>
                    <div className="text-center">
                        <div className="heading-3">{winRate.toFixed(0)}%</div>
                        <div className="small text-text-subdued">Seiersprosent</div>
                    </div>
                </div>

                {!isEligibleForRanking && (
                    <div className="p-3 mt-4 rounded-lg bg-background-alert-warning">
                        <p className="small text-text-on-alert">
                            Spill {RATING_CONFIG.MINIMUM_MATCHES_FOR_RANKING - player.matchesPlayed} kamper til for å
                            komme på ranglisten
                        </p>
                    </div>
                )}

                {recentForm.length > 0 && (
                    <div className="mt-4">
                        <h3 className="heading-5 mb-2">Seneste form</h3>
                        <div className="gap-1 flex">
                            {recentForm.map((result, index) => (
                                <span
                                    key={index}
                                    className={`w-6 h-6 text-xs font-medium flex items-center justify-center rounded ${
                                        result === 'W'
                                            ? 'bg-background-alert-success text-text-on-alert'
                                            : 'bg-background-alert-error text-text-on-alert'
                                    }`}
                                >
                                    {result}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Match History */}
            <div className="p-6">
                <h2 className="heading-4 mb-4">Kamphistorikk</h2>
            </div>

            {/* Match History */}
            <div className="p-6">
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
                                                className={`body ${isWin ? 'text-text-interactive' : 'text-text-subdued'}`}
                                            >
                                                {isWin ? 'Seier' : 'Tap'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="body">
                                                {playerScore}-{opponentScore}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="small text-text-subdued">
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
                        <p className="text-text-subdued">Ingen kamper spilt ennå</p>
                    </div>
                )}
            </div>
        </div>
    )
}
