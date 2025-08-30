import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Container } from '../components/layout/Container'
import { RootErrorComponent } from '../components/errors/RootErrorComponent'
import { Header } from '../components/header/Header'

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
            <Header />
            <main>
                <Outlet />
            </main>
            <TanStackRouterDevtools />
        </Container>
    )
}
