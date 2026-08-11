import { EmptyState } from './EmptyState'

interface NotFoundProps {
    /** Overrides the generic wording when a route knows what was missing. */
    title?: string
    description?: string
}

/**
 * The not-found screen. Used for unknown URLs and for routes that throw
 * notFound() from a loader — a profile id that matches no player, say.
 */
export function NotFound({
    title = 'Fant ikke siden',
    description = 'Siden du leter etter finnes ikke.',
}: NotFoundProps) {
    return <EmptyState title={title} description={description} actionText="Til forsiden" actionTo="/" />
}

function isNotFoundProps(data: unknown): data is NotFoundProps {
    return typeof data === 'object' && data !== null && ('title' in data || 'description' in data)
}

/**
 * The router's notFound boundary.
 *
 * A route can tailor the wording by throwing
 * `notFound({ data: { title, description } })`; anything else falls back to
 * the generic copy.
 */
export function RouteNotFound({ data }: { data?: unknown }) {
    return isNotFoundProps(data) ? <NotFound {...data} /> : <NotFound />
}
