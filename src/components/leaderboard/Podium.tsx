import type { CSSProperties } from 'react'
import { Card } from '@fremtind/jokul/card'
import { Link } from '@tanstack/react-router'
import type { LeaderboardEntry, PlayerForm } from '../../types/pong'
import { PlayerAvatar } from '../common/PlayerAvatar'
import { RankIcon } from './RankIcon'
import { medalColor } from './medalColor'
import { TierBadge } from './TierBadge'
import { FormIndicator } from './FormIndicator'

interface PodiumProps {
    /** Ranked players, best first. Only the first three are used. */
    players: LeaderboardEntry[]
    formByPlayer: Map<string, PlayerForm>
}

/**
 * The top three as a podium: first place in the middle and raised from `sm`
 * up, stacked in rank order on a phone. DOM order is rank order either way, so
 * keyboard and screen-reader order never jumps about — only `order` moves.
 */
export function Podium({ players, formByPlayer }: PodiumProps) {
    const top = players.slice(0, 3)
    if (top.length === 0) return null

    return (
        <ol aria-label="Pallen" className="m-0 grid list-none gap-12 p-0 sm:grid-cols-3 sm:items-end">
            {top.map((player, index) => {
                const rank = index + 1
                // 2nd left, 1st centre, 3rd right.
                const order = rank === 1 ? 'sm:order-2' : rank === 2 ? 'sm:order-1' : 'sm:order-3'
                return (
                    <li key={player.id} className={order}>
                        <PodiumCard player={player} rank={rank} form={formByPlayer.get(player.id)} />
                    </li>
                )
            })}
        </ol>
    )
}

function PodiumCard({ player, rank, form }: { player: LeaderboardEntry; rank: number; form: PlayerForm | undefined }) {
    const isFirst = rank === 1

    return (
        <Card
            variant="low"
            padding="l"
            clickable
            asChild
            className="lift"
            style={{ borderTop: `3px solid ${medalColor(rank)}` } as CSSProperties}
        >
            <Link
                to="/profil/$id"
                params={{ id: player.id }}
                className={`flex flex-col items-center gap-12 text-center no-underline ${isFirst ? 'sm:pb-40 sm:pt-32' : ''}`}
            >
                <RankIcon rank={rank} />
                <PlayerAvatar player={player} size={isFirst ? 'xl' : 'lg'} />
                <div className="flex min-w-0 max-w-full flex-col items-center gap-8">
                    <span className={`${isFirst ? 'heading-3' : 'heading-4'} max-w-full truncate`}>{player.name}</span>
                    <TierBadge rating={player.eloRating} />
                </div>
                <div>
                    <div className={`${isFirst ? 'heading-1' : 'heading-2'} tabular`}>{player.eloRating}</div>
                    <div className="tabular small text-text-subdued">
                        {player.wins} S · {player.losses} T · {player.winRate.toFixed(0)} %
                    </div>
                </div>
                <FormIndicator form={form} />
            </Link>
        </Card>
    )
}
