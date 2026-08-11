import { createFileRoute } from '@tanstack/react-router'
import { Leaderboard } from '../pages/Leaderboard'
import { playersQueryOptions } from '../hooks/usePlayers'
import { matchesQueryOptions } from '../hooks/useMatches'

export const Route = createFileRoute('/ledertavle')({
    // Matches are needed too now — the leaderboard shows each player's form,
    // which the leaderboard used not to need. Without this it would SSR
    // without matches and the form would pop in after hydration.
    loader: ({ context }) =>
        Promise.all([
            context.queryClient.ensureQueryData(playersQueryOptions),
            context.queryClient.ensureQueryData(matchesQueryOptions),
        ]),
    component: Leaderboard,
})
