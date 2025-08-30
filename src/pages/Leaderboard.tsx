import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '@fremtind/jokul/table'
import { WarningTag } from '@fremtind/jokul/tag'
import { Button } from '@fremtind/jokul/button'
import { useScreen } from '@fremtind/jokul/hooks'
import { RATING_CONFIG, type Player } from '../types/pong'
import { usePlayers } from '../hooks/usePlayers'
import { Link } from '@tanstack/react-router'

interface LeaderboardEntry extends Player {
    winRate: number
    isEligibleForRanking: boolean
}

export function Leaderboard() {
    const { data: players = [], isLoading } = usePlayers()
    const { isSmallDevice } = useScreen()

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
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="heading-3">Detaljert ledertavle</h1>
                <div className="gap-3 flex">
                    <Button as={Link} to="/kamper" variant="secondary">
                        Se kamper
                    </Button>
                    <Button as={Link} to="/ny-kamp" variant="primary">
                        Ny kamp
                    </Button>
                </div>
            </div>

            {eligiblePlayers.length > 0 && (
                <div>
                    <h2 className="heading-4 mb-4">Offisiell ledetavle</h2>
                    <p className="small mb-4 text-text-subdued">
                        Spillere som har spilt minst {RATING_CONFIG.MINIMUM_MATCHES_FOR_RANKING} kamper
                    </p>
                    <Table caption="Offisiell ledetavle" collapseToList={!isSmallDevice}>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Plassering</TableHeader>
                                <TableHeader>Spiller</TableHeader>
                                <TableHeader>ELO rating</TableHeader>
                                <TableHeader>Kamper</TableHeader>
                                <TableHeader>Seire</TableHeader>
                                <TableHeader>Tap</TableHeader>
                                <TableHeader>Seiersprosent</TableHeader>
                                <TableHeader>Sist spilt</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {eligiblePlayers.map((player: LeaderboardEntry, index: number) => (
                                <TableRow key={player.id}>
                                    <TableCell data-th="Plassering">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{getRankIcon(index + 1)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell data-th="Spiller">
                                        <Button
                                            as={Link}
                                            to="/profil/$id"
                                            // @ts-expect-error buggy
                                            params={{ id: player.id }}
                                            variant="ghost"
                                            className="font-medium p-0"
                                        >
                                            {player.name}
                                        </Button>
                                    </TableCell>
                                    <TableCell data-th="ELO rating">
                                        <span className="text-lg font-mono font-bold">{player.eloRating}</span>
                                    </TableCell>
                                    <TableCell data-th="Kamper">
                                        <span className="font-medium">{player.matchesPlayed}</span>
                                    </TableCell>
                                    <TableCell data-th="Seire">
                                        <span className="font-semibold text-green-600">{player.wins}</span>
                                    </TableCell>
                                    <TableCell data-th="Tap">
                                        <span className="font-semibold text-red-600">{player.losses}</span>
                                    </TableCell>
                                    <TableCell data-th="Seiersprosent">
                                        <span className="font-mono">{player.winRate.toFixed(1)}%</span>
                                    </TableCell>
                                    <TableCell data-th="Sist spilt">
                                        <span className="text-sm text-text-subdued">
                                            {player.lastPlayedAt
                                                ? new Date(player.lastPlayedAt).toLocaleDateString('no-NO', {
                                                      day: 'numeric',
                                                      month: 'short',
                                                      year: 'numeric',
                                                  })
                                                : '-'}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {pendingPlayers.length > 0 && (
                <div>
                    <h2 className="heading-4 mb-2">Ventende spillere</h2>
                    <p className="small mb-4 text-text-subdued">
                        Må spille minst {RATING_CONFIG.MINIMUM_MATCHES_FOR_RANKING} kamper for å komme på ledetavlen
                    </p>
                    <Table caption="Spillere som venter på å komme på ledetavlen" collapseToList={!isSmallDevice}>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Spiller</TableHeader>
                                <TableHeader>ELO rating</TableHeader>
                                <TableHeader>Kamper spilt</TableHeader>
                                <TableHeader>Seire</TableHeader>
                                <TableHeader>Tap</TableHeader>
                                <TableHeader>Seiersprosent</TableHeader>
                                <TableHeader>Status</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pendingPlayers.map((player: LeaderboardEntry) => (
                                <TableRow key={player.id}>
                                    <TableCell data-th="Spiller">
                                        <Button
                                            as={Link}
                                            to="/profil/$id"
                                            // @ts-expect-error buggy
                                            params={{ id: player.id }}
                                            variant="ghost"
                                            className="font-medium p-0"
                                        >
                                            {player.name}
                                        </Button>
                                    </TableCell>
                                    <TableCell data-th="ELO rating">
                                        <span className="font-mono">{player.eloRating}</span>
                                    </TableCell>
                                    <TableCell data-th="Kamper spilt">
                                        <span className="font-medium">{player.matchesPlayed}</span>
                                    </TableCell>
                                    <TableCell data-th="Seire">
                                        <span className="font-semibold text-green-600">{player.wins}</span>
                                    </TableCell>
                                    <TableCell data-th="Tap">
                                        <span className="font-semibold text-red-600">{player.losses}</span>
                                    </TableCell>
                                    <TableCell data-th="Seiersprosent">
                                        <span className="font-mono">{player.winRate.toFixed(1)}%</span>
                                    </TableCell>
                                    <TableCell data-th="Status">
                                        <WarningTag>
                                            {RATING_CONFIG.MINIMUM_MATCHES_FOR_RANKING - player.matchesPlayed} kamper
                                            igjen
                                        </WarningTag>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {players.length === 0 && (
                <div className="py-12 text-center">
                    <p className="mb-4 text-text-subdued">Ingen spillere registrert ennå</p>
                    <p className="small text-text-subdued">Start ved å registrere en ny kamp</p>
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
