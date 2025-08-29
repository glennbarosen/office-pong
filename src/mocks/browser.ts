import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(...handlers)

export async function startMSW() {
    console.log('[MSW] Starting mock service worker')

    return worker.start({
        onUnhandledRequest: 'bypass', // Prevent MSW from warning about unhandled requests
    })
}
