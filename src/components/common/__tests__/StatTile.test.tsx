import { describe, test, expect } from 'vitest'
import { renderWithProviders, screen } from '../../../test/renderWithProviders'
import { StatGrid, StatTile } from '../StatTile'

describe('StatTile', () => {
    test('pairs each label with its value as a description list', async () => {
        await renderWithProviders(
            <StatGrid>
                <StatTile label="Kamper" value={42} hint="Siste 30 dager" />
            </StatGrid>
        )

        const term = screen.getByText('Kamper')
        expect(term.tagName).toBe('DT')
        expect(term.closest('dl')).not.toBeNull()
        expect(screen.getByText('42').closest('dd')).not.toBeNull()
        expect(screen.getByText('Siste 30 dager')).toBeInTheDocument()
    })
})
