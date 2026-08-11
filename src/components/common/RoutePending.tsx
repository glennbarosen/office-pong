import { LoadingSpinner } from './LoadingSpinner'

/**
 * Shown while a route's loader runs during navigation, so clicking a link
 * gives feedback instead of a blank frame.
 *
 * Distinct from the in-page loading states: this covers navigation, those
 * cover refetches of data the page is already showing.
 */
export function RoutePending() {
    return <LoadingSpinner message="Laster siden..." />
}
