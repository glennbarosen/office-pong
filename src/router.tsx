import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { QueryClient } from '@tanstack/react-query'

export function getRouter() {
    // Must be constructed per router, not at module scope. TanStack Start calls
    // getRouter() once per request (see startRequestResolver in
    // @tanstack/start-server-core), so a module-level client would be a single
    // cache shared by every request and every user of the long-lived Node server.
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: 3,
                staleTime: 5 * 60 * 1000,
            },
        },
    })

    const router = createRouter({
        routeTree,
        scrollRestoration: true,
        context: {
            queryClient,
        },
    })

    return router
}

declare module '@tanstack/react-router' {
    interface Register {
        router: ReturnType<typeof getRouter>
    }
}
