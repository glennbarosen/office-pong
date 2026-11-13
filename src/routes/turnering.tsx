import { createFileRoute } from '@tanstack/react-router'
import { Tournament } from '../pages/Tournament'
import { playersQueryOptions } from '../hooks/usePlayers'
import { matchesQueryOptions } from '../hooks/useMatches'
import { tournamentsQueryOptions } from '../hooks/useTournaments'

export const Route = createFileRoute('/turnering')({
    loader: ({ context }) =>
        Promise.all([
            context.queryClient.ensureQueryData(tournamentsQueryOptions),
            context.queryClient.ensureQueryData(playersQueryOptions),
            context.queryClient.ensureQueryData(matchesQueryOptions),
        ]),
    component: Tournament,
})
