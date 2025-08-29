export interface EnvironmentVariables {
    API_BASE_URL: string
    ENVIRONMENT: 'localhost' | 'test' | 'prod'
}

const LOCAL_DEFAULTS: EnvironmentVariables = {
    API_BASE_URL: 'http://localhost:5173',
    ENVIRONMENT: 'localhost',
}

const isPlaceHolder = (value: string) => value.startsWith('__') && value.endsWith('__')
const hasNoWindow = typeof window === 'undefined' || !window.ENV
const hasPlaceHolder = window.ENV && Object.values(window.ENV).some(isPlaceHolder)

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const env = hasNoWindow || hasPlaceHolder ? LOCAL_DEFAULTS : window.ENV!
