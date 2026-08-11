import { TableHead, TableRow, TableHeader, TableBody, TableCell } from '@fremtind/jokul/table'
import { WarningTag } from '@fremtind/jokul/tag'
import { usePlayers } from '../hooks/usePlayers'
import { useMatches } from '../hooks/useMatches'
import { createFormByPlayer, createLeaderboardEntries, formatDate } from '../utils/gameUtils'
import { PlayerLink } from '../components/common/PlayerLink'
import { RankIcon } from '../components/leaderboard/RankIcon'
import { FormIndicator } from '../components/leaderboard/FormIndicator'
import { TierBadge } from '../components/leaderboard/TierBadge'
import { EmptyState } from '../components/common/EmptyState'
import { NO_PLAYERS_EMPTY_STATE } from '../lib/messages'
import { QueryState } from '../components/common/QueryState'
import { CollapsibleTable } from '../components/common/CollapsibleTable'

export function Leaderboard() {
    const playersQuery = usePlayers()
    const matchesQuery = useMatches()
    const players = playersQuery.data ?? []
    const matches = matchesQuery.data ?? []

    // Filter and sort players for leaderboard
    const leaderboardData = createLeaderboardEntries(players)
    const formByPlayer = createFormByPlayer(matches)

    return (
        <QueryState queries={[playersQuery, matchesQuery]}>
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
                                    <TableHeader>Form</TableHeader>
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
                                            {player.isEligibleForRanking ? (
                                                <TierBadge rating={player.eloRating} />
                                            ) : (
                                                <WarningTag>Mangler kamper</WarningTag>
                                            )}
                                        </TableCell>
                                        <TableCell data-th="Kamper">{player.matchesPlayed}</TableCell>
                                        <TableCell data-th="Seire">{player.wins}</TableCell>
                                        <TableCell data-th="Tap">{player.losses}</TableCell>
                                        <TableCell data-th="Seiersprosent">{player.winRate.toFixed(1)}%</TableCell>
                                        <TableCell data-th="Form">
                                            <FormIndicator form={formByPlayer.get(player.id)} />
                                        </TableCell>
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

                {players.length === 0 && <EmptyState {...NO_PLAYERS_EMPTY_STATE} />}
            </div>
        </QueryState>
    )
}
