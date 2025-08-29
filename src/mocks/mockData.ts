// Mock options for form testing
export const mockMessageTypes = [
    { label: 'Info', value: 'INFO' },
    { label: 'Advarsel', value: 'WARNING' },
    { label: 'Feil', value: 'ERROR' },
] as const

export const mockClientTypes = [
    { label: 'SAM', value: 'SAM' },
    { label: 'SKS', value: 'SKS' },
    { label: 'Kundesøk BM', value: 'KUNDESOK_BM' },
] as const

export const mockDistGroups = [
    { label: 'Fremtind', value: 'FRE' },
    { label: 'SpareBank 1', value: 'SB1' },
    { label: 'DNB', value: 'DNB' },
    { label: 'Eika', value: 'EIK' },
    { label: 'Fana Sparebank', value: 'FAN' },
    { label: 'Møre Sparebank', value: 'MOR' },
] as const

// Mock form data for testing
export const mockFormData = {
    title: 'Test melding',
    message: 'Dette er en test melding',
    type: 'INFO' as const,
    publishFrom: '2025-06-20T09:00:00.000Z',
    publishTo: '2025-06-21T09:00:00.000Z',
    clients: ['SAM'],
    distGroups: ['FRE', 'SB1'],
    isDismissible: true,
    isDisabled: false,
}
