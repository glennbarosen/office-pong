import { defaultPlugins, defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
    experimentalParser: true,
    input: 'https://rk-admin.intern.app.devaws.fremtind.no/api/docs/api-docs',

    output: {
        path: 'src/types',
        format: 'prettier',
        lint: 'eslint',
    },
    plugins: [
        ...defaultPlugins,
        '@tanstack/react-query',
        {
            name: '@hey-api/client-fetch',
            baseUrl: false,
        },
    ],
})
