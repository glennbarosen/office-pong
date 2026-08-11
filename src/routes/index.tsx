import { createFileRoute } from '@tanstack/react-router'
import { Overview } from '../pages/Overview'
import { playersQueryOptions } from '../hooks/usePlayers'
import { matchesQueryOptions } from '../hooks/useMatches'

export const Route = createFileRoute('/')({
    loader: ({ context }) =>
        Promise.all([
            context.queryClient.ensureQueryData(playersQueryOptions),
            context.queryClient.ensureQueryData(matchesQueryOptions),
        ]),
    component: Overview,
})
