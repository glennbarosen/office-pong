import { createFileRoute, notFound } from '@tanstack/react-router'
import { Profile } from '../pages/Profile'
import { playersQueryOptions } from '../hooks/usePlayers'
import { matchesQueryOptions } from '../hooks/useMatches'
import { PLAYER_NOT_FOUND } from '../lib/messages'

export const Route = createFileRoute('/profil/$id')({
    loader: async ({ context, params }) => {
        const [players] = await Promise.all([
            context.queryClient.ensureQueryData(playersQueryOptions),
            context.queryClient.ensureQueryData(matchesQueryOptions),
        ])

        // A real 404 for an unknown id, rather than a page that renders a
        // not-found screen with a 200.
        if (!players.some((player) => player.id === params.id)) {
            // notFound() returns a router control-flow signal, not an Error;
            // throwing it is TanStack Router's documented API.
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw notFound({ data: PLAYER_NOT_FOUND })
        }
    },
    component: ProfileComponent,
})

// Kept deliberately: Profile takes `id` as a prop so it stays a plain component
// (and testable as one), and useParams is only available inside the route.
function ProfileComponent() {
    const { id } = Route.useParams()
    return <Profile id={id} />
}
