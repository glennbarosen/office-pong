import { formatDate } from '../../utils/gameUtils'

interface DateDisplayProps {
    dateString: string
    includeTime?: boolean
    className?: string
}

export function DateDisplay({ dateString, className = '' }: DateDisplayProps) {
    return (
        <div className={`${className}`}>
            <div>{formatDate(dateString)}</div>
        </div>
    )
}
