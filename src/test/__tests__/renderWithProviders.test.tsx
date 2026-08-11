import { describe, test, expect } from 'vitest'
import { useQuery } from '@tanstack/react-query'
import { renderWithProviders, screen, waitFor } from '../renderWithProviders'
import { EmptyState } from '../../components/common/EmptyState'
import { PlayerLink } from '../../components/common/PlayerLink'

/**
 * Smoke tests for the harness itself: these prove a component can reach the
 * router and the query client. Broad component coverage is not the goal here.
 */
describe('renderWithProviders', () => {
    test('renders a plain component', async () => {
        await renderWithProviders(<EmptyState title="Ingen kamper registrert" />)

        expect(screen.getByText('Ingen kamper registrert')).toBeInTheDocument()
    })

    test('provides a router, so route-aware links render', async () => {
        await renderWithProviders(<EmptyState title="Ingen kamper" actionText="Registrer kamp" actionTo="/ny-kamp" />)

        expect(screen.getByRole('link', { name: 'Registrer kamp' })).toHaveAttribute('href', '/ny-kamp')
    })

    test('builds param links', async () => {
        await renderWithProviders(<PlayerLink playerId="abc-123" playerName="Ada" />)

        expect(screen.getByRole('link', { name: 'Ada' })).toHaveAttribute('href', '/profil/abc-123')
    })

    test('provides a query client', async () => {
        function Greeting() {
            const { data } = useQuery({ queryKey: ['greeting'], queryFn: () => Promise.resolve('Hei') })
            return <span>{data ?? 'Laster'}</span>
        }

        const { queryClient } = await renderWithProviders(<Greeting />)

        await waitFor(() => expect(screen.getByText('Hei')).toBeInTheDocument())
        expect(queryClient.getQueryData(['greeting'])).toBe('Hei')
    })
})
