import type { ReactNode } from 'react'
import { Button } from '@fremtind/jokul/button'
import { Icon } from '@fremtind/jokul/icon'
import { Link } from '@tanstack/react-router'

interface EmptyStateProps {
    title: string
    description?: string
    actionText?: string
    actionTo?: string
    children?: ReactNode
}

export function EmptyState({ title, description, actionText, actionTo, children }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center gap-8 rounded border border-dashed border-border-separator px-24 py-40 text-center">
            <Icon variant="medium" className="text-text-subdued" aria-hidden="true">
                sports_tennis
            </Icon>
            <p className="body font-bold">{title}</p>
            {description && <p className="small max-w-[28rem] text-text-subdued">{description}</p>}
            {actionText && actionTo && (
                <div className="mt-16">
                    <Button as={Link} to={actionTo} variant="primary">
                        {actionText}
                    </Button>
                </div>
            )}
            {children}
        </div>
    )
}
