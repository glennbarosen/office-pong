import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRightIcon } from '@fremtind/jokul/icon'

interface SectionHeaderProps {
    id?: string
    title: ReactNode
    /** Optional "see all" link at the right. */
    linkTo?: string
    linkText?: string
}

/** An <h2> section title, optionally with a "Se alle"-style link across from it. */
export function SectionHeader({ id, title, linkTo, linkText = 'Se alle' }: SectionHeaderProps) {
    return (
        <div className="mb-16 flex items-baseline justify-between gap-16">
            <h2 id={id} className="heading-4">
                {title}
            </h2>
            {linkTo && (
                <Link
                    to={linkTo}
                    className="small inline-flex items-center gap-4 font-bold text-text-default underline-offset-4 hover:underline"
                >
                    {linkText}
                    <ArrowRightIcon variant="small" aria-hidden="true" />
                </Link>
            )}
        </div>
    )
}
