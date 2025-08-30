import { EnvironmentVariables } from './src/utils/env'
interface ImportMeta {
    readonly env: ImportMetaEnv
}

declare global {
    interface Window {
        readonly ENV?: EnvironmentVariables
    }
}
