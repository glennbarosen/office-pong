import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'

import { routeTree } from './routeTree.gen'

import './styles/global.scss'

import { startMSW } from './mocks'
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query'
import { getUserOptions } from './types/@tanstack/react-query.gen'

if (import.meta.env.VITE_MOCK_ENABLED === 'true') {
    startMSW()
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                if (error.message === 'Authorization required.') return false
                return failureCount < 3
            },
        },
    },
    queryCache: new QueryCache({
        onError: (error) => {
            if (error.message === 'Authorization required.') {
                // Invalidate user query to force re-authentication
                queryClient.invalidateQueries({
                    queryKey: getUserOptions().queryKey,
                })
            }
        },
    }),
})

// Declare router context types before creating the router
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

const router = createRouter({
    routeTree,
    context: {
        queryClient,
    },
})

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        </StrictMode>
    )
}
