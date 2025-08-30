import { Button } from '@fremtind/jokul/button'
import { Link } from '@tanstack/react-router'

interface EmptyStateProps {
    title: string
    description?: string
    actionText?: string
    actionTo?: string
    children?: React.ReactNode
}

export function EmptyState({ title, description, actionText, actionTo, children }: EmptyStateProps) {
    return (
        <div className="py-12 text-center">
            <p className="mb-4 text-text-subdued">{title}</p>
            {description && <p className="small text-text-subdued">{description}</p>}
            {actionText && actionTo && (
                <div className="mt-6">
                    <Button as={Link} to={actionTo} variant="primary">
                        {actionText}
                    </Button>
                </div>
            )}
            {children}
        </div>
    )
}
