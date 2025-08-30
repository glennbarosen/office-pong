import { getRankIcon } from '../../utils/gameUtils'

interface RankDisplayProps {
    rank: number
    className?: string
}

export function RankDisplay({ rank, className = 'text-lg' }: RankDisplayProps) {
    return (
        <div className="flex items-center gap-2">
            <span className={className}>{getRankIcon(rank)}</span>
        </div>
    )
}
