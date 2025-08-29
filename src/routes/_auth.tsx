import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getUserOptions } from '../types/@tanstack/react-query.gen'
import { Header } from '../components/header/Header'

export const Route = createFileRoute('/_auth')({
    beforeLoad: async ({ context: { queryClient } }) => {
        try {
            const user = await queryClient.ensureQueryData({ ...getUserOptions(), staleTime: 60 * 60 * 1000 }) // 1 hour stale time
            return { user }
        } catch {
            throw redirect({ to: '/ikke-autorisert' })
        }
    },
    component: () => (
        <>
            <Header />
            <Outlet />
        </>
    ),
})
