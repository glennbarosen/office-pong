import type { ReactNode } from 'react'
import { LoadingSpinner } from './LoadingSpinner'

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
    children: ReactNode
}

/**
 * One place for the loading/error handling every list page needs.
 *
 * Pages default their data to [], which makes "still loading" and "loaded and
 * genuinely empty" indistinguishable downstream — that was the Profile
 * false-negative bug, where a profile flashed "Spiller ikke funnet" on every
 * visit. Gate on the query state here instead of re-deriving it per page.
 */
export function QueryState({ queries, children }: QueryStateProps) {
    if (queries.some((query) => query.isPending)) {
        return <LoadingSpinner />
    }

    return <>{children}</>
}
