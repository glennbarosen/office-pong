import { TableHead, TableRow, TableHeader, TableBody, TableCell } from '@fremtind/jokul/table'
import type { OpponentStats } from '../../types'
import { PlayerLink } from '../common/PlayerLink'
import { PlayerAvatar } from '../common/PlayerAvatar'
import { EmptyState } from '../common/EmptyState'
import { CollapsibleTable } from '../common/CollapsibleTable'
import { formatDate } from '../../utils/gameUtils'

interface HeadToHeadTableProps {
    /** Already sorted strongest-rivalry-first by createOpponentStats. */
    stats: OpponentStats[]
}

/**
 * "Am I beating Marius?" — one row per opponent this player has faced.
 *
 * Same collapse-to-list pattern as the leaderboard table
 * (src/pages/Leaderboard.tsx), built on the same CollapsibleTable.
 */
export function HeadToHeadTable({ stats }: HeadToHeadTableProps) {
    if (stats.length === 0) {
        return <EmptyState title="Ingen motstandere ennå" description="Denne spilleren har ikke spilt noen kamper." />
    }

    return (
        <CollapsibleTable>
            <TableHead>
                <TableRow>
                    <TableHeader>Motstander</TableHeader>
                    <TableHeader>Kamper</TableHeader>
                    <TableHeader>Seire</TableHeader>
                    <TableHeader>Tap</TableHeader>
                    <TableHeader>Seiersprosent</TableHeader>
                    <TableHeader>ELO-endring</TableHeader>
                    <TableHeader>Sist spilt</TableHeader>
                </TableRow>
            </TableHead>
            <TableBody>
                {stats.map((stat) => (
                    <TableRow key={stat.opponent.id}>
                        <TableCell data-th="Motstander">
                            <div className="flex items-center gap-8">
                                <PlayerAvatar player={stat.opponent} />
                                <PlayerLink playerId={stat.opponent.id} playerName={stat.opponent.name} />
                            </div>
                        </TableCell>
                        <TableCell data-th="Kamper">{stat.totalMatches}</TableCell>
                        <TableCell data-th="Seire">{stat.wins}</TableCell>
                        <TableCell data-th="Tap">{stat.losses}</TableCell>
                        <TableCell data-th="Seiersprosent">{stat.winRate.toFixed(0)}%</TableCell>
                        <TableCell data-th="ELO-endring">
                            {stat.eloChange > 0 ? `+${stat.eloChange}` : stat.eloChange}
                        </TableCell>
                        <TableCell data-th="Sist spilt">
                            <span className="text-sm text-text-subdued">{formatDate(stat.lastMatch)}</span>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </CollapsibleTable>
    )
}
