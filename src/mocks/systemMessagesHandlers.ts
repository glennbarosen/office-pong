import { http, HttpResponse, delay } from 'msw'
import { mockSystemMessages } from './systemMessages'
import type { SystemMessageDto } from '../types'

// Add some realistic delay to simulate network latency
const ARTIFICIAL_DELAY_MS = 400

export const systemMessagesHandlers = [
    // GET all system messages
    http.get('/api/system-messages', async () => {
        await delay(ARTIFICIAL_DELAY_MS)
        return HttpResponse.json(mockSystemMessages)
    }),

    // GET single system message by ID
    http.get('/api/system-messages/:id', async ({ params }) => {
        await delay(ARTIFICIAL_DELAY_MS)
        const { id } = params
        const message = mockSystemMessages.find((message) => message.id === id)

        if (!message) {
            return new HttpResponse(null, { status: 404 })
        }

        return HttpResponse.json(message)
    }),

    // POST create new system message
    http.post('/api/system-messages', async ({ request }) => {
        await delay(ARTIFICIAL_DELAY_MS)
        const newMessage = (await request.json()) as Omit<SystemMessageDto, 'id'>

        // Generate a new ID and timestamps
        const createdMessage: SystemMessageDto = {
            ...newMessage,
            id: String(mockSystemMessages.length + 1),
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
        }

        // In a real mock server we would add this to our mockSystemMessages array
        // For now we'll just return it as if it was created

        return HttpResponse.json(createdMessage, { status: 201 })
    }),

    // PUT update system message
    http.put('/api/system-messages/:id', async ({ request, params }) => {
        await delay(ARTIFICIAL_DELAY_MS)
        const { id } = params
        const updatedData = (await request.json()) as Partial<SystemMessageDto>
        const existingMessage = mockSystemMessages.find((message) => message.id === id)

        if (!existingMessage) {
            return new HttpResponse(null, { status: 404 })
        }

        // Create updated message with current timestamp
        const updatedMessage = {
            ...existingMessage,
            ...updatedData,
            lastModified: new Date().toISOString(),
        }

        // In a real mock server we would update the message in our mockSystemMessages array
        // For now we'll just return it as if it was updated

        return HttpResponse.json(updatedMessage)
    }),

    // DELETE system message
    http.delete('/api/system-messages/:id', async ({ params }) => {
        await delay(ARTIFICIAL_DELAY_MS)
        const { id } = params
        const messageIndex = mockSystemMessages.findIndex((message) => message.id === id)

        if (messageIndex === -1) {
            return new HttpResponse(null, { status: 404 })
        }

        // In a real mock server we would remove the message from our mockSystemMessages array
        // For now we'll just return a success response

        return new HttpResponse(null, { status: 204 })
    }),
]
