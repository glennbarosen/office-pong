import { formatDate } from '../../utils/gameUtils'

interface DateDisplayProps {
    dateString: string
    className?: string
}

export function DateDisplay({ dateString, className = '' }: DateDisplayProps) {
    return <div className={className}>{formatDate(dateString)}</div>
}
