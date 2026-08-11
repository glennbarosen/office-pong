/**
 * Recharts types its tooltip payload loosely — `payload` is an optional array
 * of loosely-typed entries. Narrow it once here rather than casting per chart,
 * keeping the optional index handling noUncheckedIndexedAccess requires.
 */
export function firstPayload<T>(payload: ReadonlyArray<unknown> | undefined): T | undefined {
    const entry = payload?.[0] as { payload?: T } | undefined
    return entry?.payload
}
