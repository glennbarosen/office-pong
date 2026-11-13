import { createFileRoute } from '@tanstack/react-router'
import { NewMatch } from '../pages/NewMatch'
import { playersQueryOptions } from '../hooks/usePlayers'
import { matchesQueryOptions } from '../hooks/useMatches'
import { tournamentsQueryOptions } from '../hooks/useTournaments'

export const Route = createFileRoute('/ny-kamp')({
    loader: ({ context }) =>
        Promise.all([
            context.queryClient.ensureQueryData(playersQueryOptions),
            context.queryClient.ensureQueryData(matchesQueryOptions),
            context.queryClient.ensureQueryData(tournamentsQueryOptions),
        ]),
    component: NewMatch,
})
