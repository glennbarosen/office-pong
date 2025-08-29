import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render } from '@testing-library/react'

import { routeTree } from '../routeTree.gen'

interface TestRouter {
    initialPath?: string
    initialEntries?: string[]
    queryClient?: QueryClient
}

const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    })

/**
 * Create a test router with the given initial path and entries.
 * This uses the route tree from the generated file and a memory history for defining the path of the component you want to test.
 */
const createTestRouter = ({ initialPath, initialEntries, queryClient }: TestRouter) => {
    const memoryHistory = initialEntries ? createMemoryHistory({ initialEntries }) : undefined
    const basepath = initialPath ?? '/'

    return createRouter({
        routeTree,
        basepath,
        history: memoryHistory,
        context: { queryClient: queryClient ?? createTestQueryClient() },
    })
}

export function renderWithProviders({ initialPath, initialEntries }: TestRouter) {
    const testQueryClient = createTestQueryClient()
    const testRouter = createTestRouter({ initialPath, initialEntries, queryClient: testQueryClient })
    return render(
        <QueryClientProvider client={testQueryClient}>
            <RouterProvider router={testRouter} />
        </QueryClientProvider>
    )
}
