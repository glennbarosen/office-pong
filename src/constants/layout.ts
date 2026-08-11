/**
 * Layout breakpoints.
 *
 * Two constants, not one, because they answer different questions and are
 * measured against different things. They were previously two unexplained
 * magic numbers in three files.
 */

/**
 * Viewport width below which we treat the device as a phone, for chart
 * sizing — tick sizes, margins, whether axis labels fit at all.
 *
 * Matches Tailwind's `sm` breakpoint, which the same components use for their
 * `sm:` classes; they must agree or the chart restyles at a different width
 * than the card around it.
 */
export const MOBILE_BREAKPOINT = 640

/**
 * Container width at or below which a table collapses into a list.
 *
 * Measured on the table's own container rather than the viewport, so a table
 * in a narrow column collapses even on a wide screen. That is why this is not
 * MOBILE_BREAKPOINT: it is about how much room the table has, not what kind
 * of device is showing it.
 */
export const TABLE_COLLAPSE_WIDTH = 1000
