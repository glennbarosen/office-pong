import type { PropsWithChildren } from 'react'

export const Container = ({ children }: PropsWithChildren) => (
    <div className="mx-auto flex max-w-screen-lg flex-col px-16">{children}</div>
)
