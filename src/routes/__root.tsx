import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Container } from '../components/layout/Container'
import { RootErrorComponent } from '../components/errors/RootErrorComponent'

import '../components/links/header-link.scss'
import type { QueryClient } from '@tanstack/react-query'

interface RouterContext {
    queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
    component: Root,
    errorComponent: RootErrorComponent,
})

function Root() {
    return (
        <Container>
            <main className="mb-64">
                <Outlet />
            </main>
            <TanStackRouterDevtools />
        </Container>
    )
}
