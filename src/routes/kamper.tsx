import { createFileRoute } from '@tanstack/react-router'
import { Matches } from '../pages/Matches'
import { playersQueryOptions } from '../hooks/usePlayers'
import { matchesQueryOptions } from '../hooks/useMatches'
import { tournamentsQueryOptions } from '../hooks/useTournaments'

export const Route = createFileRoute('/kamper')({
    loader: ({ context }) =>
        Promise.all([
            context.queryClient.ensureQueryData(matchesQueryOptions),
            context.queryClient.ensureQueryData(playersQueryOptions),
            context.queryClient.ensureQueryData(tournamentsQueryOptions),
        ]),
    component: Matches,
})
