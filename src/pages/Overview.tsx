import {
    Table,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell,
    Tag,
    Button,
    Card,
    WarningTag,
} from '@fremtind/jokul'
import { RATING_CONFIG, type Player } from '../types/pong'
import { usePlayers } from '../hooks/usePlayers'
import { Link } from '@tanstack/react-router'

interface LeaderboardEntry extends Player {
    winRate: number
    isEligibleForRanking: boolean
}

export function Overview() {
    const { data: players = [], isLoading } = usePlayers()

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

    const eligiblePlayers = leaderboardData.filter((player: LeaderboardEntry) => player.isEligibleForRanking)
    const pendingPlayers = leaderboardData.filter((player: LeaderboardEntry) => !player.isEligibleForRanking)

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

    if (isLoading) {
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

            {leaderboardData.length > 0 && (
                <div className="mx-4">
                    <div className="mb-6">
                        <h2 className="heading-4 mb-4">Offisiell rangliste</h2>
                        <Table caption="Spillere på ranglisten">
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Rang</TableHeader>
                                    <TableHeader>Spiller</TableHeader>
                                    <TableHeader>ELO</TableHeader>
                                    <TableHeader>Seire</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {eligiblePlayers.map((player: LeaderboardEntry, index: number) => (
                                    <TableRow key={player.id}>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <span className="text-lg font-bold">#{index + 1}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{player.name}</div>
                                                <div className="text-sm text-gray-500">
                                                    {player.wins}-{player.losses} ({player.winRate.toFixed(0)}%)
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-lg font-mono">{player.eloRating}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-semibold text-green-600">{player.wins}</span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {pendingPlayers.length > 0 && (
                <div className="mx-4">
                    <div className="mb-6">
                        <h2 className="heading-4 mb-2">Ventende spillere</h2>
                        <p className="small mb-4 text-text-subdued">
                            Må spille minst {RATING_CONFIG.MINIMUM_MATCHES_FOR_RANKING} kamper for å komme på ranglisten
                        </p>
                        <Table caption="Spillere som venter på å komme på ranglisten">
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Spiller</TableHeader>
                                    <TableHeader>ELO</TableHeader>
                                    <TableHeader>Kamper</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pendingPlayers.map((player: LeaderboardEntry) => (
                                    <TableRow key={player.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{player.name}</div>
                                                <div className="text-sm text-gray-500">
                                                    {player.wins}-{player.losses}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono">{player.eloRating}</span>
                                        </TableCell>
                                        <TableCell>{player.matchesPlayed}</TableCell>
                                        <TableCell>
                                            <Tag>
                                                {RATING_CONFIG.MINIMUM_MATCHES_FOR_RANKING - player.matchesPlayed} igjen
                                            </Tag>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {players.length === 0 && (
                <div className="px-4 py-12 text-center">
                    <p className="mb-4 text-text-subdued">Ingen spillere registrert ennå</p>
                    <p className="small text-text-subdued">Start ved å registrere en ny kamp</p>
                </div>
            )}
        </>
    )
}
