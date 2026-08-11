import type { ReactNode } from 'react'
import { Button } from '@fremtind/jokul/button'
import { ErrorMessage } from '@fremtind/jokul/message'
import { SkeletonAnimation, SkeletonElement } from '@fremtind/jokul/loader'

/**
 * The parts of a TanStack Query result this component needs. Structural rather
 * than UseQueryResult so callers can pass results for differently-typed data
 * in one array.
 */
export interface QueryStateLike {
    isPending: boolean
    isError: boolean
    refetch: () => unknown
}

interface QueryStateProps {
    /** Every query the page needs before it can render anything truthful. */
    queries: QueryStateLike[]
    /**
     * Placeholder rows to hold the layout while loading. Set it to roughly what
     * the page usually shows, so data arriving does not shift the page.
     */
    skeletonRows?: number
    children: ReactNode
}

const DEFAULT_SKELETON_ROWS = 5

/**
 * One place for the loading/error handling every list page needs.
 *
 * Pages default their data to [], which makes "still loading" and "loaded and
 * genuinely empty" indistinguishable downstream — that was the Profile
 * false-negative bug, where a profile flashed "Spiller ikke funnet" on every
 * visit. It also meant a failed fetch rendered a cheerful "no matches yet"
 * when the truth was that the database was unreachable. Gate on the query
 * state here instead of re-deriving it per page.
 */
export function QueryState({ queries, skeletonRows = DEFAULT_SKELETON_ROWS, children }: QueryStateProps) {
    const failed = queries.filter((query) => query.isError)

    if (failed.length > 0) {
        return (
            // One live region for the page's data-loading failure. role="alert"
            // rather than a polite status: the page is showing nothing useful,
            // so it is worth interrupting for.
            <ErrorMessage role="alert" title="Kunne ikke hente data" className="my-24">
                <p>Vi fikk ikke kontakt med serveren. Sjekk nettforbindelsen og prøv igjen.</p>
                <Button
                    variant="secondary"
                    className="mt-16"
                    onClick={() => {
                        // Only the queries that actually failed — a working one
                        // does not need to be refetched to clear this state.
                        failed.forEach((query) => void query.refetch())
                    }}
                >
                    Prøv igjen
                </Button>
            </ErrorMessage>
        )
    }

    if (queries.some((query) => query.isPending)) {
        return <QueryStateSkeleton rows={skeletonRows} />
    }

    return <>{children}</>
}

/**
 * Placeholder rows that hold the page's dimensions.
 *
 * Replaces a centred "Laster..." that swapped out the whole page, collapsing
 * the layout and shifting focus on every refetch.
 *
 * role/aria-live are set explicitly: SkeletonAnimation gives its container
 * aria-busy and an aria-label, but no role — and aria-label on a plain div is
 * not dependably exposed. Without them the skeleton is silent, which is worse
 * than the spinner it replaces.
 */
function QueryStateSkeleton({ rows }: { rows: number }) {
    return (
        <SkeletonAnimation
            role="status"
            aria-live="polite"
            textDescription="Laster innhold"
            className="my-24 flex flex-col gap-16"
        >
            {Array.from({ length: rows }, (_, index) => (
                <SkeletonElement key={index} width="100%" height="3rem" />
            ))}
        </SkeletonAnimation>
    )
}
