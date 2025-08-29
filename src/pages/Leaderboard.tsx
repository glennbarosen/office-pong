import { Card, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, Tag } from '@fremtind/jokul'
import { RATING_CONFIG, type Player } from '../types/pong'
import { usePlayers } from '../hooks/usePlayers'

interface LeaderboardEntry extends Player {
    winRate: number
    isEligibleForRanking: boolean
}

export function Leaderboard() {
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

    if (isLoading) {
        return (
            <div className="flex min-h-64 items-center justify-center">
                <div>Laster...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="py-6 px-4">
                <h1 className="text-2xl mb-2 text-center font-bold">Bordtennis Rangliste</h1>
                <p className="text-sm text-gray-600 text-center">
                    Basert på tillitsbasert rapportering av kampresultater
                </p>
            </div>

            {eligiblePlayers.length > 0 && (
                <Card className="mx-4">
                    <div className="p-4">
                        <h2 className="text-lg font-semibold mb-4">Offisiell rangliste</h2>
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
                </Card>
            )}

            {pendingPlayers.length > 0 && (
                <Card className="mx-4">
                    <div className="p-4">
                        <h2 className="text-lg font-semibold mb-2">Ventende spillere</h2>
                        <p className="text-sm text-gray-600 mb-4">
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
                </Card>
            )}

            {players.length === 0 && (
                <div className="px-4 py-12 text-center">
                    <p className="text-gray-500 mb-4">Ingen spillere registrert ennå</p>
                    <p className="text-sm text-gray-400">Start ved å registrere en ny kamp</p>
                </div>
            )}
        </div>
    )
}
