import { createFileRoute } from '@tanstack/react-router'
import { CreateMessage } from '../../pages/CreateMessage'

export const Route = createFileRoute('/_auth/opprett')({
    component: CreateMessage,
})
