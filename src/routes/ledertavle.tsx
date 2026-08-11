import { createFileRoute } from '@tanstack/react-router'
import { Leaderboard } from '../pages/Leaderboard'
import { playersQueryOptions } from '../hooks/usePlayers'

export const Route = createFileRoute('/ledertavle')({
    loader: ({ context }) => context.queryClient.ensureQueryData(playersQueryOptions),
    component: Leaderboard,
})
