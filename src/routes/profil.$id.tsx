import { createFileRoute } from '@tanstack/react-router'
import { Profile } from '../pages/Profile'
import { playersQueryOptions } from '../hooks/usePlayers'
import { matchesQueryOptions } from '../hooks/useMatches'

export const Route = createFileRoute('/profil/$id')({
    loader: ({ context }) =>
        Promise.all([
            context.queryClient.ensureQueryData(playersQueryOptions),
            context.queryClient.ensureQueryData(matchesQueryOptions),
        ]),
    component: ProfileComponent,
})

// Kept deliberately: Profile takes `id` as a prop so it stays a plain component
// (and testable as one), and useParams is only available inside the route.
function ProfileComponent() {
    const { id } = Route.useParams()
    return <Profile id={id} />
}
