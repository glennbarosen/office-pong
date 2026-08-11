import type { ReactNode } from 'react'
import { Table } from '@fremtind/jokul/table'
import { useElementDimensions } from '@fremtind/jokul/hooks'

/**
 * Width at or below which the table collapses into a list. Measured on the
 * table's own container rather than the viewport, so a narrow column collapses
 * even on a wide screen.
 */
const COLLAPSE_TO_LIST_WIDTH = 1000

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
    const shouldCollapse = dimensions.width <= COLLAPSE_TO_LIST_WIDTH

    return (
        <div ref={elementRef} className={className}>
            <Table fullWidth caption="" collapseToList data-collapse={shouldCollapse ? 'true' : undefined}>
                {children}
            </Table>
        </div>
    )
}
