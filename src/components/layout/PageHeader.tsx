import type { ReactNode } from 'react'

interface PageHeaderProps {
    title: ReactNode
    subtitle?: ReactNode
    /** Optional action aligned to the right, e.g. a primary button. */
    action?: ReactNode
}

/** The opening of every titled page: its single <h1>, a line of context, an action. */
export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
    return (
        <div className="mb-24 flex flex-wrap items-end justify-between gap-16 sm:mb-40">
            <div className="min-w-0">
                <h1 className="heading-2">{title}</h1>
                {subtitle && <p className="body mt-8 text-text-subdued">{subtitle}</p>}
            </div>
            {action}
        </div>
    )
}
