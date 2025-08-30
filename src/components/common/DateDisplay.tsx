import { formatDate } from '../../utils/gameUtils'

interface DateDisplayProps {
    dateString: string
    includeTime?: boolean
    className?: string
}

export function DateDisplay({ dateString, includeTime = false, className = '' }: DateDisplayProps) {
    return (
        <div className={`text-sm ${className}`}>
            <div>{formatDate(dateString)}</div>
            {includeTime && (
                <div className="text-xs text-text-subdued">
                    {new Date(dateString).toLocaleTimeString('no-NO', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </div>
            )}
        </div>
    )
}
