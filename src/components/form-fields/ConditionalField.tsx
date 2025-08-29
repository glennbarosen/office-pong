import type { ReactNode } from 'react'

interface ConditionalFieldProps {
    condition: boolean
    children: ReactNode
    className?: string
}

export const ConditionalField = ({ condition, children, className }: ConditionalFieldProps) => {
    if (!condition) return null

    return <div className={className}>{children}</div>
}
