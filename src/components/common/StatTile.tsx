import type { ReactNode } from 'react'

interface StatTileProps {
    label: string
    value: ReactNode
    /** A short line of context under the value. */
    hint?: ReactNode
}

/**
 * One headline number. Renders a dt/dd pair, so a set of tiles must sit in a
 * StatGrid (a <dl>) — that is what lets a screen reader read "Kamper: 42"
 * rather than two unrelated lines.
 */
export function StatTile({ label, value, hint }: StatTileProps) {
    return (
        <div className="flex min-w-0 flex-col gap-4 rounded bg-background-container-low px-16 py-12">
            <dt className="small text-text-subdued">{label}</dt>
            <dd className="m-0 flex min-w-0 flex-col gap-4">
                <span className="tabular heading-3 truncate">{value}</span>
                {hint && <span className="small truncate text-text-subdued">{hint}</span>}
            </dd>
        </div>
    )
}

interface StatGridProps {
    children: ReactNode
    className?: string
}

export function StatGrid({ children, className = '' }: StatGridProps) {
    return <dl className={`m-0 grid grid-cols-2 gap-8 sm:gap-12 ${className}`}>{children}</dl>
}
