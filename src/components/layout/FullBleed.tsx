import type { PropsWithChildren } from 'react'

interface Props extends PropsWithChildren {
    className?: string
}

export const FullBleed = ({ children, className = '' }: Props) => (
    <div className={`relative left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] w-screen ${className}`}>{children}</div>
)
