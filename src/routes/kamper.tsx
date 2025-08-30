import { createFileRoute } from '@tanstack/react-router'
import { Matches } from '../pages/Matches'

export const Route = createFileRoute('/kamper')({
    component: Matches,
})
