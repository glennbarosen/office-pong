import type { ReactNode } from 'react'
import { Table } from '@fremtind/jokul/table'
import { useElementDimensions } from '@fremtind/jokul/hooks'
import { TABLE_COLLAPSE_WIDTH } from '../../constants/layout'

interface CollapsibleTableProps {
    /** TableHead and TableBody. */
    children: ReactNode
    className?: string
}

/**
 * A Jøkul table that collapses to a list when its container gets narrow.
 *
 * The measure-and-collapse wiring was copy-pasted verbatim between the
 * leaderboard and the match list, breakpoint included.
 */
export function CollapsibleTable({ children, className }: CollapsibleTableProps) {
    const [elementRef, dimensions] = useElementDimensions<HTMLDivElement>(350)
    const shouldCollapse = dimensions.width <= TABLE_COLLAPSE_WIDTH

    return (
        <div ref={elementRef} className={className}>
            <Table fullWidth caption="" collapseToList data-collapse={shouldCollapse ? 'true' : undefined}>
                {children}
            </Table>
        </div>
    )
}
