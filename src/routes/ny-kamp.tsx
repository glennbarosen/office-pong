import { createFileRoute } from '@tanstack/react-router'
import NewMatch from '../pages/NewMatch'

export const Route = createFileRoute('/ny-kamp')({
    component: NewMatch,
})
