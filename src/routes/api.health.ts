import { createFileRoute } from '@tanstack/react-router'

/**
 * Liveness endpoint for the container HEALTHCHECK and any uptime monitor.
 *
 * Deliberately does not touch the database: it answers "is the Node process
 * serving requests", which is what an orchestrator restarts on. A database
 * outage is a separate signal and should not cycle the app container.
 */
export const Route = createFileRoute('/api/health')({
    server: {
        handlers: {
            GET: () =>
                new Response(JSON.stringify({ status: 'ok' }), {
                    status: 200,
                    headers: { 'content-type': 'application/json' },
                }),
        },
    },
})
