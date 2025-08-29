import { createFileRoute } from '@tanstack/react-router'
import { Unauthorized } from '../pages/Unauthorized'

export const Route = createFileRoute('/ikke-autorisert')({
    component: Unauthorized,
})
