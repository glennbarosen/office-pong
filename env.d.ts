import { EnvironmentVariables } from './src/utils/env'

interface ImportMetaEnv {
    readonly VITE_MOCK_ENABLED?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

declare global {
    interface Window {
        readonly ENV?: EnvironmentVariables
    }
}
