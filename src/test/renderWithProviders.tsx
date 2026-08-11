import type { ReactElement } from 'react'
import { act, render, type RenderOptions, type RenderResult } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
    createRootRoute,
    createRoute,
    createRouter,
    createMemoryHistory,
    RouterProvider,
    Outlet,
} from '@tanstack/react-router'

/**
 * A QueryClient with retries and caching disabled — a failing test should fail
 * on the first attempt, not three retries later.
 */
export function createTestQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: { retry: false, staleTime: 0, gcTime: 0 },
            mutations: { retry: false },
        },
    })
}

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
    /** Initial URL for the memory history. Defaults to `/`. */
    route?: string
    /** Pass an existing client to assert on cache contents. */
    queryClient?: QueryClient
}

export interface RenderWithProvidersResult extends RenderResult {
    queryClient: QueryClient
}

/**
 * Mount a component with the providers the app supplies in production: a
 * TanStack Query client and a router.
 *
 * The component under test is mounted as the only route, on a memory history,
 * so `useNavigate`, `<Link>` and route context all work without pulling in the
 * generated route tree or touching the DOM's location.
 */
export async function renderWithProviders(
    ui: ReactElement,
    options: RenderWithProvidersOptions = {}
): Promise<RenderWithProvidersResult> {
    const { route = '/', queryClient = createTestQueryClient(), ...renderOptions } = options

    const rootRoute = createRootRoute({ component: Outlet })
    const uiRoute = createRoute({
        getParentRoute: () => rootRoute,
        // Matches any path, so callers can pass `route` to exercise params.
        path: '$',
        component: () => ui,
    })

    const router = createRouter({
        routeTree: rootRoute.addChildren([uiRoute]),
        history: createMemoryHistory({ initialEntries: [route] }),
        context: { queryClient },
    })

    // RouterProvider renders nothing until the router has resolved its initial
    // match, so await that before handing the DOM back to the test.
    await router.load()

    // The router settles its initial match in an effect, so mount inside `act`
    // to flush that update rather than leaking an act(...) warning into tests.
    let result!: RenderResult
    await act(async () => {
        result = render(
            <QueryClientProvider client={queryClient}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment -- the test router isn't the app's registered router type */}
                <RouterProvider router={router as any} />
            </QueryClientProvider>,
            renderOptions
        )
        // Let the router's mount effects settle inside this act scope.
        await Promise.resolve()
    })

    return { ...result, queryClient }
}

export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
