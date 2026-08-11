import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { QueryClient, dehydrate, hydrate, type DehydratedState } from '@tanstack/react-query'
import { RoutePending } from './components/common/RoutePending'
import { RouteNotFound } from './components/common/NotFound'

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
        defaultPendingComponent: RoutePending,
        defaultNotFoundComponent: RouteNotFound,
        // Carries what the loaders fetched on the server into the browser's
        // cache. Without this the client refetches everything SSR just
        // rendered, which is most of the point of having loaders at all.
        //
        // Passed as a JSON string rather than the object: the router requires
        // its dehydrated payload to be provably serializable and rejects
        // react-query's `readonly unknown[]` query keys. Everything in the
        // cache genuinely is JSON — the row mappers convert timestamps to ISO
        // strings, and react-query dehydrates only successful queries — so
        // this round-trips losslessly instead of asserting the constraint away.
        dehydrate: () => ({ queryClientState: JSON.stringify(dehydrate(queryClient)) }),
        hydrate: (dehydrated) => {
            hydrate(queryClient, JSON.parse(dehydrated.queryClientState) as DehydratedState)
        },
    })

    return router
}

declare module '@tanstack/react-router' {
    interface Register {
        router: ReturnType<typeof getRouter>
    }
}
