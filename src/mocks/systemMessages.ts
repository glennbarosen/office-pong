import type { SystemMessageDto } from '../types'

// Mock data for system messages based on realistic Norwegian insurance domain data
export const mockSystemMessages: SystemMessageDto[] = [
    {
        id: '1',
        title: 'Ny biltariffjustering',
        message: 'Nye biltariffer for elbiler er tilgjengelig fra 19. mai 2025. Se detaljer i Kundeportalen.',
        type: 'INFO',
        publishFrom: '2025-05-19T08:00:00Z',
        publishTo: '2025-07-15T23:59:59Z',
        createdBy: 'system-admin',
        clients: ['SAM', 'SKS'],
        distGroups: ['FRE', 'SB1'],
        isDismissible: true,
        isDisabled: false,
        isActive: true, // Within publish window and not disabled
        createdAt: '2025-05-19T07:30:00Z',
        lastModified: '2025-05-19T07:30:00Z',
    },
    {
        id: '2',
        title: 'Vedlikehold av rådgiversystemet',
        message: 'Rådgiversystemet utilgjengelig 02:00-04:00 natt til lørdag 7. juli. Planlegg kundemøter deretter.',
        type: 'ERROR',
        publishFrom: '2025-07-04T00:00:00Z',
        publishTo: '2025-07-08T23:59:59Z',
        createdBy: 'IT-driftsansvarlig',
        clients: ['SAM', 'KUNDESOK_BM'],
        distGroups: ['DNB', 'FAN'],
        isDismissible: true,
        isDisabled: false,
        isActive: false, // Future dates - inactive
        createdAt: '2025-05-20T10:15:00Z',
        lastModified: '2025-05-20T10:15:00Z',
    },
    {
        id: '3',
        title: 'Nye helsevurderingskriterier',
        message:
            'Nye helsevurderingskriterier for liv- og uføreforsikring fra 1. juni. Se dokumentasjon under "Helsevurdering".',
        type: 'WARNING',
        publishFrom: '2025-05-15T00:00:00Z',
        publishTo: '2025-07-01T23:59:59Z',
        createdBy: 'medisinsk-fagansvarlig',
        clients: ['SKS'],
        distGroups: ['FRE', 'SB1', 'DNB'],
        isDismissible: false,
        isDisabled: true, // Manually disabled
        isActive: false, // Disabled regardless of publish window
        createdAt: '2025-05-14T14:45:00Z',
        lastModified: '2025-05-14T14:45:00Z',
    },
    {
        id: '4',
        title: undefined, // Demonstrates optional title field
        message: 'Dette er en melding uten tittel for å demonstrere at tittel-feltet er valgfritt.',
        type: 'INFO',
        publishFrom: '2025-05-25T00:00:00Z',
        publishTo: '2025-07-30T23:59:59Z',
        createdBy: 'system',
        clients: ['SAM', 'KUNDESOK_BM'],
        distGroups: ['MOR', 'EIK'],
        isDismissible: true,
        isDisabled: false,
        isActive: true, // Active timeframe
        createdAt: '2025-05-22T11:30:00Z',
        lastModified: '2025-05-22T11:30:00Z',
    },
]
