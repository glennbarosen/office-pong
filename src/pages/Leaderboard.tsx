import { TableHead, TableRow, TableHeader, TableBody, TableCell } from '@fremtind/jokul/table'
import { WarningTag } from '@fremtind/jokul/tag'
import { usePlayers } from '../hooks/usePlayers'
import { createLeaderboardEntries, formatDate } from '../utils/gameUtils'
import { PlayerLink } from '../components/common/PlayerLink'
import { RankIcon } from '../components/leaderboard/RankIcon'
import { EmptyState } from '../components/common/EmptyState'
import { QueryState } from '../components/common/QueryState'
import { CollapsibleTable } from '../components/common/CollapsibleTable'

export function Leaderboard() {
    const playersQuery = usePlayers()
    const players = playersQuery.data ?? []

    // Filter and sort players for leaderboard
    const leaderboardData = createLeaderboardEntries(players)

    return (
        <QueryState queries={[playersQuery]}>
            <div className="space-y-8">
                {leaderboardData.length > 0 && (
                    <div>
                        <h1 className="heading-4 mb-4">Ledertavle</h1>

                        <CollapsibleTable>
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
                                {leaderboardData.map((player, index: number) => (
                                    <TableRow key={player.id}>
                                        <TableCell data-th="Plassering">
                                            <RankIcon rank={index + 1} />
                                        </TableCell>
                                        <TableCell data-th="Spiller">
                                            <PlayerLink playerId={player.id} playerName={player.name} />
                                        </TableCell>
                                        <TableCell data-th="ELO rating">
                                            {player.eloRating}{' '}
                                            {!player.isEligibleForRanking && <WarningTag>Mangler kamper</WarningTag>}
                                        </TableCell>
                                        <TableCell data-th="Kamper">{player.matchesPlayed}</TableCell>
                                        <TableCell data-th="Seire">{player.wins}</TableCell>
                                        <TableCell data-th="Tap">{player.losses}</TableCell>
                                        <TableCell data-th="Seiersprosent">{player.winRate.toFixed(1)}%</TableCell>
                                        <TableCell data-th="Sist spilt">
                                            <span className="text-sm text-text-subdued">
                                                {player.lastPlayedAt ? formatDate(player.lastPlayedAt) : '-'}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </CollapsibleTable>
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
        </QueryState>
    )
}
