import type { ReactNode } from 'react'
import { Button } from '@fremtind/jokul/button'
import { ErrorMessage } from '@fremtind/jokul/message'
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
 * visit. It also meant a failed fetch rendered a cheerful "no matches yet"
 * when the truth was that the database was unreachable. Gate on the query
 * state here instead of re-deriving it per page.
 */
export function QueryState({ queries, children }: QueryStateProps) {
    const failed = queries.filter((query) => query.isError)

    if (failed.length > 0) {
        return (
            <ErrorMessage title="Kunne ikke hente data" className="my-24">
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
        return <LoadingSpinner />
    }

    return <>{children}</>
}
