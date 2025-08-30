import '@testing-library/jest-dom'

// Mock environment variables for tests
Object.defineProperty(window, 'ENV', {
    value: {
        SUPABASE_URL: 'http://localhost:54321',
        SUPABASE_ANON_KEY: 'test-key',
    },
    writable: true,
})
