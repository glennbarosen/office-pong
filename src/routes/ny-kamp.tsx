import { createFileRoute } from '@tanstack/react-router'
import NewMatch from '../pages/NewMatch'
import { playersQueryOptions } from '../hooks/usePlayers'

export const Route = createFileRoute('/ny-kamp')({
    loader: ({ context }) => context.queryClient.ensureQueryData(playersQueryOptions),
    component: NewMatch,
})
