/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import { createRootRouteWithContext, Outlet, HeadContent, Scripts, useRouterState } from '@tanstack/react-router'
import { Container } from '../components/layout/Container'
import { RootErrorComponent } from '../components/errors/RootErrorComponent'
import { Header } from '../components/header/Header'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { JokulRouterLink } from '../components/links/JokulRouterLink'
import { resolveTheme, THEME_INIT_SCRIPT } from '../lib/theme'

import '../styles/global.scss'

interface RouterContext {
    queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
    head: () => ({
        meta: [
            { charSet: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { title: 'Kontorpong 🏓' },
        ],
        links: [{ rel: 'icon', href: '/favicon-32x32.png', type: 'image/png' }],
    }),
    component: RootComponent,
    errorComponent: RootErrorComponent,
})

function RootComponent() {
    return (
        <RootDocument>
            <Root />
        </RootDocument>
    )
}

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
        </Container>
    )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
    const { queryClient } = Route.useRouteContext()
    // Resolved from the request cookies on the server, so the document is
    // rendered in the user's theme instead of always light-then-corrected.
    const theme = resolveTheme()

    return (
        <html lang="no">
            <head>
                <HeadContent />
            </head>
            {/* THEME_INIT_SCRIPT may correct data-theme before hydration for a
                first-time visitor whose OS prefers dark; that divergence from
                the server-rendered value is the whole point of it. */}
            <body className="jkl" data-theme={theme} suppressHydrationWarning>
                <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                <Scripts />
            </body>
        </html>
    )
}
