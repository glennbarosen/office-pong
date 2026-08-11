import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        environment: 'happy-dom',
        setupFiles: ['./src/test/setup.ts'],
        globals: true,
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        exclude: ['node_modules', 'dist', '.output'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov'],
            // Pure logic only — the layers worth measuring today.
            include: ['src/lib/**', 'src/utils/**'],
            exclude: ['src/lib/server/**', '**/*.test.ts'],
            // No threshold gate yet: measure first.
        },
    },
})
