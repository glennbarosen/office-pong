/**
 * User-facing Norwegian copy that more than one module needs, or that encodes
 * a rule. Strings used in exactly one place stay inline where they read best.
 */

export const PLAYER_NOT_FOUND = {
    title: 'Spiller ikke funnet',
    description: 'Spilleren du leter etter finnes ikke.',
} as const

/**
 * The rule that a match needs two distinct players is checked twice — once by
 * MatchService.isSameSide (matchService.ts), once by createMatchInputSchema's
 * final refine (validation.ts). They are deliberately not unified: isSameSide
 * cross-checks a new name against the roster, the schema refine only compares
 * within the payload it was given. Only the message they report on failure is
 * shared.
 */
export const SAME_PLAYER_MESSAGE = 'Spillerne må være forskjellige'

/** The EmptyState the leaderboard and the overview show when there are no players yet — identical on both. */
export const NO_PLAYERS_EMPTY_STATE = {
    title: 'Ingen spillere registrert ennå',
    description: 'Start ved å registrere en ny kamp',
    actionText: 'Registrer første kamp',
    actionTo: '/ny-kamp',
} as const
