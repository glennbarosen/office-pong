import type { PropsWithChildren } from 'react'

interface ContainerProps extends PropsWithChildren {
    className?: string
}

/**
 * The page's content column. One width for the header, the bottom bar and the
 * page itself, so their edges line up.
 */
export const Container = ({ children, className = '' }: ContainerProps) => (
    <div className={`mx-auto w-full max-w-[72rem] px-16 sm:px-24 ${className}`}>{children}</div>
)
