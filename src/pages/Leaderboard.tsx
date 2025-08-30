import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '@fremtind/jokul/table'
import { WarningTag } from '@fremtind/jokul/tag'
import { Button } from '@fremtind/jokul/button'
import { useScreen } from '@fremtind/jokul/hooks'
import { RATING_CONFIG } from '../types/pong'
import { usePlayers } from '../hooks/usePlayers'
import { Link } from '@tanstack/react-router'
import { createLeaderboardEntries, formatDate } from '../utils/gameUtils'
import { PlayerLink } from '../components/common/PlayerLink'
import { RankDisplay } from '../components/common/RankDisplay'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { EmptyState } from '../components/common/EmptyState'

export function Leaderboard() {
    const { data: players = [], isLoading } = usePlayers()
    const { isSmallDevice } = useScreen()

    // Filter and sort players for leaderboard
    const leaderboardData = createLeaderboardEntries(players)

    const eligiblePlayers = leaderboardData.filter((player) => player.isEligibleForRanking)
    const pendingPlayers = leaderboardData.filter((player) => !player.isEligibleForRanking)

    if (isLoading) {
        return <LoadingSpinner />
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
                            {eligiblePlayers.map((player, index: number) => (
                                <TableRow key={player.id}>
                                    <TableCell data-th="Plassering">
                                        <RankDisplay rank={index + 1} />
                                    </TableCell>
                                    <TableCell data-th="Spiller">
                                        <PlayerLink playerId={player.id} playerName={player.name} />
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
                                            {player.lastPlayedAt ? formatDate(player.lastPlayedAt) : '-'}
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
                            {pendingPlayers.map((player) => (
                                <TableRow key={player.id}>
                                    <TableCell data-th="Spiller">
                                        <PlayerLink playerId={player.id} playerName={player.name} />
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
                <EmptyState
                    title="Ingen spillere registrert ennå"
                    description="Start ved å registrere en ny kamp"
                    actionText="Registrer første kamp"
                    actionTo="/ny-kamp"
                />
            )}
        </div>
    )
}
