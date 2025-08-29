import { createFileRoute } from '@tanstack/react-router'
import { Profile } from '../pages/Profile'

export const Route = createFileRoute('/profil/$id')({
    component: ProfileComponent,
})

function ProfileComponent() {
    const { id } = Route.useParams()
    return <Profile id={id} />
}
