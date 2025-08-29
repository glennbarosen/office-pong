import { createFileRoute } from '@tanstack/react-router'
import { Archive } from '../../pages/Archive'

export const Route = createFileRoute('/_auth/arkiv')({
    component: Archive,
})
