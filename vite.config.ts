import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'

export default defineConfig({
    server: {
        port: 3000,
    },
    plugins: [tanstackStart({ target: 'react' }), nitro({ preset: 'node' }), react()],
})
