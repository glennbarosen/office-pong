// Mock Service Worker (MSW) entry point
import { startMSW } from './browser'

// Export the MSW starter function
export { startMSW }

// Export mock data for testing
export { mockSystemMessages } from './systemMessages'
export { mockMessageTypes, mockClientTypes, mockDistGroups, mockFormData } from './mockData'
