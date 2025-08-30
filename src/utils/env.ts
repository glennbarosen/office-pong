export interface EnvironmentVariables {
    SUPABASE_URL: string
    SUPABASE_ANON_KEY: string
    ENVIRONMENT?: string
}

const LOCAL_DEFAULTS: EnvironmentVariables = {
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
    SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'development',
}

const isPlaceHolder = (value: string) => value.startsWith('__') && value.endsWith('__')
const hasNoWindow = typeof window === 'undefined' || !window.ENV
const hasPlaceHolder = window.ENV && Object.values(window.ENV).some(isPlaceHolder)

export const env = hasNoWindow || hasPlaceHolder ? LOCAL_DEFAULTS : window.ENV!
