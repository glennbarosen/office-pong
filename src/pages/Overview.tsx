import { Button } from '@fremtind/jokul/button'
import { Card } from '@fremtind/jokul/card'
import { WarningTag } from '@fremtind/jokul/tag'
import { RATING_CONFIG, type Player } from '../types/pong'
import { usePlayers } from '../hooks/usePlayers'
import { useMatches } from '../hooks/useMatches'
import { Link } from '@tanstack/react-router'

interface LeaderboardEntry extends Player {
    winRate: number
    isEligibleForRanking: boolean
}

export function Overview() {
    const { data: players = [], isLoading: isLoadingPlayers } = usePlayers()
    const { data: matches = [], isLoading: isLoadingMatches } = useMatches()

    // Create a map for quick player lookup
    const playerMap = new Map<string, Player>()
    players.forEach((player) => {
        playerMap.set(player.id, player)
    })

    // Filter and sort players for leaderboard
    const leaderboardData: LeaderboardEntry[] = players
        .map((player: Player) => ({
            ...player,
            winRate: player.matchesPlayed > 0 ? (player.wins / player.matchesPlayed) * 100 : 0,
            isEligibleForRanking: player.matchesPlayed >= RATING_CONFIG.MINIMUM_MATCHES_FOR_RANKING,
        }))
        .sort((a: LeaderboardEntry, b: LeaderboardEntry) => {
            // Eligible players first, then by ELO rating
            if (a.isEligibleForRanking && !b.isEligibleForRanking) return -1
            if (!a.isEligibleForRanking && b.isEligibleForRanking) return 1
            return b.eloRating - a.eloRating
        })

    // Get recent matches with player names
    const recentMatches = matches
        .slice()
        .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime())
        .slice(0, 5)
        .map((match) => {
            const player1 = playerMap.get(match.player1Id)
            const player2 = playerMap.get(match.player2Id)
            const winner = playerMap.get(match.winnerId)

            return {
                ...match,
                player1Name: player1?.name || 'Ukjent',
                player2Name: player2?.name || 'Ukjent',
                winnerName: winner?.name || 'Ukjent',
            }
        })

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return '🥇'
            case 2:
                return '🥈'
            case 3:
                return '🥉'
            default:
                return `${rank}.`
        }
    }

    if (isLoadingPlayers || isLoadingMatches) {
        return (
            <div className="flex min-h-64 items-center justify-center">
                <div>Laster...</div>
            </div>
        )
    }

    return (
        <>
            <div className="flex justify-end">
                <Button as={Link} to="/ny-kamp" variant="primary">
                    Ny kamp
                </Button>
            </div>
            <div className="flex flex-col gap-12">
                <h2 className="heading-4">Topp 5</h2>
                {leaderboardData.slice(0, 5).map((player, i) => {
                    return (
                        <Card key={player.id} variant="low" padding="xl" clickable asChild>
                            <Link to="/profil/$id" params={{ id: player.id }} className="no-underline">
                                <div className="flex items-start gap-12">
                                    <div className="body">{getRankIcon(i + 1)}</div>
                                    <div className="flex flex-1 flex-col">
                                        <div className="flex items-center justify-between">
                                            <div className="body">{player.name}</div>
                                            {player.isEligibleForRanking ? (
                                                <div className="body font-bold">{player.eloRating}</div>
                                            ) : (
                                                <WarningTag>Mangler kamper</WarningTag>
                                            )}
                                        </div>
                                        <div className="text-text-subdued">
                                            {player.wins} seire - {player.losses} tap ({player.winRate.toFixed(0)}%
                                            seier)
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </Card>
                    )
                })}
                <div className="flex justify-center">
                    <Button as={Link} to="/ledertavle" variant="secondary">
                        Se alle
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-12">
                <h2 className="heading-4">Siste 5 kamper</h2>
                {recentMatches.map((match) => {
                    const isPlayer1Winner = match.winnerId === match.player1Id
                    return (
                        <Card key={match.id} variant="low" padding="xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Link
                                            to="/profil/$id"
                                            params={{ id: match.player1Id }}
                                            className="font-medium text-text-interactive hover:underline"
                                        >
                                            {match.player1Name}
                                        </Link>
                                        {isPlayer1Winner && <span className="text-green-600">🏆</span>}
                                    </div>
                                    <span className="text-text-subdued">vs</span>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            to="/profil/$id"
                                            params={{ id: match.player2Id }}
                                            className="font-medium text-text-interactive hover:underline"
                                        >
                                            {match.player2Name}
                                        </Link>
                                        {!isPlayer1Winner && <span className="text-green-600">🏆</span>}
                                    </div>
                                </div>
                                <div className="body font-bold">
                                    {match.player1Score} - {match.player2Score}
                                </div>
                            </div>
                        </Card>
                    )
                })}
                <div className="flex justify-center">
                    <Button as={Link} to="/kamper" variant="secondary">
                        Se alle
                    </Button>
                </div>
            </div>

            {players.length === 0 && (
                <div className="px-4 py-12 text-center">
                    <p className="mb-4 text-text-subdued">Ingen spillere registrert ennå</p>
                    <p className="small text-text-subdued">Start ved å registrere en ny kamp</p>
                </div>
            )}
        </>
    )
}
