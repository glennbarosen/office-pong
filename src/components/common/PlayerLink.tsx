import { JokulRouterLink } from '../links/JokulRouterLink'

interface PlayerLinkProps {
    playerId: string
    playerName: string
}

/**
 * A link to a player's profile, styled as a Jøkul link.
 *
 * Goes through JokulRouterLink — TanStack's createLink(Link) — rather than
 * `<Link as={RouterLink}>`. The `as` form loses the route's param types
 * through Jøkul's polymorphism, which is what the `@ts-expect-error - Router
 * typing issue with params` here used to suppress. createLink exists for
 * precisely this, and the wrapper was already in the codebase.
 */
export function PlayerLink({ playerId, playerName }: PlayerLinkProps) {
    return (
        <JokulRouterLink className="underline" to="/profil/$id" params={{ id: playerId }}>
            {playerName}
        </JokulRouterLink>
    )
}
