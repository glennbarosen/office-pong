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

/** Skip-link target. */
const MAIN_CONTENT_ID = 'hovedinnhold'

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
            {/* First focusable element on the page, so a keyboard user can get
                past the header without tabbing through it. Hidden until
                focused, which is what makes it a skip link rather than chrome. */}
            <a
                href={`#${MAIN_CONTENT_ID}`}
                className="sr-only focus:not-sr-only focus:absolute focus:left-16 focus:top-16 focus:z-50 focus:rounded focus:bg-background-container-high focus:px-16 focus:py-8"
            >
                Hopp til hovedinnhold
            </a>
            <Header />
            {showBackButton && (
                <nav aria-label="Tilbake" className="my-16">
                    <JokulRouterLink to="/">← Hjem</JokulRouterLink>
                </nav>
            )}
            {/* tabIndex allows the skip link to move focus here, not just scroll. */}
            <main id={MAIN_CONTENT_ID} tabIndex={-1} className="mb-64">
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
