import { describe, test, expect } from 'vitest'
import { render } from '@testing-library/react'
import { TierBadge } from '../TierBadge'
import { EloService } from '../../../lib/eloService'

describe('TierBadge', () => {
    test('renders the tier name EloService.getRatingTier reports for the rating', () => {
        const { getByText } = render(<TierBadge rating={1900} />)

        expect(getByText(EloService.getRatingTier(1900).tier)).toBeInTheDocument()
        expect(getByText('Stormester')).toBeInTheDocument()
    })

    test('renders the lowest tier for a low rating', () => {
        const { getByText } = render(<TierBadge rating={1000} />)

        expect(getByText('Nybegynner')).toBeInTheDocument()
    })
})
