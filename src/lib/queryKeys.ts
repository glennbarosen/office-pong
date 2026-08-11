/**
 * The single source of truth for TanStack Query cache keys.
 *
 * Hand-written `['matches']` literals scattered across hooks are how a
 * mutation ends up invalidating a key nobody reads — keep every key here.
 */
export const queryKeys = {
    players: ['players'] as const,
    matches: ['matches'] as const,
} as const
