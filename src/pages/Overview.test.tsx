import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '../utils/test-utils'

describe('Overview', () => {
    it('should render the overview page with system messages', async () => {
        // Test through the full route since the component needs router context
        const { findByText } = renderWithProviders({ initialEntries: ['/'] })

        // Check if the main heading is rendered
        const heading = await findByText('Driftsmeldinger')
        expect(heading).toBeInTheDocument()

        // Check if the create button is rendered
        const createButton = await findByText('Opprett melding')
        expect(createButton).toBeInTheDocument()

        // Check if the card sections are rendered
        const activeMessages = await findByText('Aktive meldinger')
        expect(activeMessages).toBeInTheDocument()

        const deactivatedMessages = await findByText('Deaktiverte meldinger')
        expect(deactivatedMessages).toBeInTheDocument()

        const inactiveMessages = await findByText('Siste inaktive meldinger')
        expect(inactiveMessages).toBeInTheDocument()
    })

    it('should display active messages from MSW mock data', async () => {
        const { findByText } = renderWithProviders({ initialEntries: ['/'] })

        // Check if we can see the active message from our mock data
        // Only "Ny biltariffjustering" and the message without title should be active
        const messageContent1 = await findByText(/Nye biltariffer for elbiler/)
        expect(messageContent1).toBeInTheDocument()

        const messageContent2 = await findByText(
            'Dette er en melding uten tittel for å demonstrere at tittel-feltet er valgfritt.'
        )
        expect(messageContent2).toBeInTheDocument()
    })

    it('should display disabled messages from MSW mock data', async () => {
        const { findByText } = renderWithProviders({ initialEntries: ['/'] })

        // The disabled message section should exist
        const deactivatedSection = await findByText('Deaktiverte meldinger')
        expect(deactivatedSection).toBeInTheDocument()

        // Note: Our mock data has no messages that are both isActive=true AND isDisabled=true
        // So this section will be empty, which is correct behavior
    })

    it('should display inactive messages from MSW mock data', async () => {
        const { findByText } = renderWithProviders({ initialEntries: ['/'] })

        // The inactive message section should exist
        const inactiveSection = await findByText('Siste inaktive meldinger')
        expect(inactiveSection).toBeInTheDocument()

        // Both message 2 (future dates) and message 3 (disabled) have isActive: false
        // so they should appear in this section
        const messageContent1 = await findByText(/Rådgiversystemet utilgjengelig/)
        expect(messageContent1).toBeInTheDocument()

        const messageContent2 = await findByText(/Nye helsevurderingskriterier for liv- og uføreforsikring/)
        expect(messageContent2).toBeInTheDocument()
    })
})
