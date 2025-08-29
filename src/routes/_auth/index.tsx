import { createFileRoute } from '@tanstack/react-router'
import { Overview } from '../../pages/Overview'

export const Route = createFileRoute('/_auth/')({
    component: Overview,
})
