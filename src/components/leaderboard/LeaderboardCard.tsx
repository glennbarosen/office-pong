import type { CSSProperties } from 'react'
import { Card } from '@fremtind/jokul/card'
import { Link } from '@tanstack/react-router'
import { RATING_CONFIG, type LeaderboardEntry, type PlayerForm } from '../../types/pong'
import { PlayerAvatar } from '../common/PlayerAvatar'
import { RankIcon } from './RankIcon'
import { medalColor } from './medalColor'
import { FormIndicator } from './FormIndicator'
import { TierBadge } from './TierBadge'

interface LeaderboardCardProps {
    player: LeaderboardEntry
    /** Position among ranked players. Omitted for a player not yet ranked. */
    rank?: number
    form: PlayerForm | undefined
}

/**
 * One standing as a tappable row: rank, player, record, form, rating.
 *
 * The same row serves the overview's top five, the full leaderboard and the
 * "not ranked yet" list, at every width — it replaced a nine-column table that
 * collapsed into a wall of label/value pairs on a phone.
 */
export function LeaderboardCard({ player, rank, form }: LeaderboardCardProps) {
    const accent = rank ? medalColor(rank) : undefined
    const matchesLeft = Math.max(0, RATING_CONFIG.MINIMUM_MATCHES_FOR_RANKING - player.matchesPlayed)

    return (
        <Card
            variant="low"
            padding="m"
            clickable
            asChild
            className={accent ? 'accent-edge lift' : 'lift'}
            style={accent ? ({ '--accent-color': accent } as CSSProperties) : undefined}
        >
            <Link to="/profil/$id" params={{ id: player.id }} className="no-underline">
                <div className="flex items-center gap-12 sm:gap-16">
                    {rank !== undefined && <RankIcon rank={rank} />}
                    <PlayerAvatar player={player} size="md" />

                    <div className="flex min-w-0 flex-1 flex-col gap-4">
                        <div className="flex min-w-0 items-center gap-8">
                            <span className="body truncate font-bold">{player.name}</span>
                            {player.isEligibleForRanking && (
                                <span className="hidden sm:inline-flex">
                                    <TierBadge rating={player.eloRating} />
                                </span>
                            )}
                        </div>
                        <span className="tabular small text-text-subdued">
                            {player.wins} S · {player.losses} T · {player.winRate.toFixed(0)} %
                        </span>
                    </div>

                    <div className="hidden md:block">
                        <FormIndicator form={form} showStreakTag={false} />
                    </div>

                    <div className="shrink-0 text-right">
                        {player.isEligibleForRanking ? (
                            <>
                                <div className="tabular heading-4">{player.eloRating}</div>
                                <div className="small text-text-subdued">ELO</div>
                            </>
                        ) : (
                            <>
                                <div className="tabular heading-4">{matchesLeft}</div>
                                <div className="small text-text-subdued">
                                    {matchesLeft === 1 ? 'kamp igjen' : 'kamper igjen'}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </Link>
        </Card>
    )
}
