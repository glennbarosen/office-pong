import React from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from '../routeTree.gen'

// Create a custom render function that includes providers
const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
            mutations: {
                retry: false,
            },
        },
    })

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    initialEntries?: string[]
    queryClient?: QueryClient
}

const customRender = (ui: React.ReactElement, options: CustomRenderOptions = {}) => {
    const { initialEntries = ['/'], queryClient = createTestQueryClient(), ...renderOptions } = options

    const memoryHistory = createMemoryHistory({
        initialEntries,
    })

    const router = createRouter({
        routeTree,
        history: memoryHistory,
        context: undefined!,
    })

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
            {children}
        </QueryClientProvider>
    )

    return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Re-export specific functions to avoid linting issues
export { render as originalRender, screen, fireEvent, waitFor, act } from '@testing-library/react'
export { customRender as render, createTestQueryClient }
