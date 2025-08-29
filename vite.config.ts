import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import { readFileSync } from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [TanStackRouterVite({ target: 'react', autoCodeSplitting: true }), react()],
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },
        },
        host: 'local.test.sparebank1.no',
        open: true,
        cors: {
            origin: false,
        },
        https: {
            key: readFileSync('./certs/self-signed.key'),
            cert: readFileSync('./certs/self-signed.crt'),
        },
    },
})
