import { Card } from '@fremtind/jokul/card'
import { WarningTag } from '@fremtind/jokul/tag'
import { Link } from '@tanstack/react-router'
import type { LeaderboardEntry } from '../../types'
import type { PlayerForm } from '../../types/pong'
import { RankIcon } from './RankIcon'
import { FormIndicator } from './FormIndicator'
import { TierBadge } from './TierBadge'

interface LeaderboardCardProps {
    player: LeaderboardEntry
    rank: number
    form: PlayerForm | undefined
}

/**
 * One leaderboard standing as a tappable card.
 *
 * The compact counterpart to the leaderboard table: same entries from
 * createLeaderboardEntries, fewer columns, used where only the top few matter.
 */
export function LeaderboardCard({ player, rank, form }: LeaderboardCardProps) {
    return (
        <Card variant="low" padding="m" clickable asChild>
            <Link to="/profil/$id" params={{ id: player.id }} className="no-underline">
                <div className="flex items-start gap-12">
                    <div className="body">
                        <RankIcon rank={rank} />
                    </div>
                    <div className="flex flex-1 flex-col">
                        <div className="flex items-center justify-between">
                            <div className="body">{player.name}</div>
                            {player.isEligibleForRanking ? (
                                <div className="flex items-center gap-8">
                                    <div className="body font-bold">{player.eloRating}</div>
                                    <TierBadge rating={player.eloRating} />
                                </div>
                            ) : (
                                <WarningTag>Mangler kamper</WarningTag>
                            )}
                        </div>
                        <div className="text-text-subdued">
                            {player.wins} seire - {player.losses} tap ({player.winRate.toFixed(0)}% seier)
                        </div>
                        <div className="mt-4">
                            <FormIndicator form={form} />
                        </div>
                    </div>
                </div>
            </Link>
        </Card>
    )
}
