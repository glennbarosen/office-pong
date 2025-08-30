import { createRootRouteWithContext, Outlet, useRouterState } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Container } from '../components/layout/Container'
import { RootErrorComponent } from '../components/errors/RootErrorComponent'
import { Header } from '../components/header/Header'

import type { QueryClient } from '@tanstack/react-query'
import { JokulRouterLink } from '../components'

interface RouterContext {
    queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
    component: Root,
    errorComponent: RootErrorComponent,
})

function Root() {
    const routerState = useRouterState()
    const showBackButton = routerState.location.pathname !== '/'

    return (
        <Container>
            <Header />
            {showBackButton && (
                <div className="my-16">
                    <JokulRouterLink to="/">← Hjem</JokulRouterLink>
                </div>
            )}
            <main className="mb-64">
                <Outlet />
            </main>
            <TanStackRouterDevtools />
        </Container>
    )
}
