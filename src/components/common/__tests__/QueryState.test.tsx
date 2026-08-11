import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryState, type QueryStateLike } from '../QueryState'

function query(overrides: Partial<QueryStateLike> = {}): QueryStateLike {
    return { isPending: false, isError: false, refetch: vi.fn(), ...overrides }
}

describe('QueryState', () => {
    test('renders children once every query has settled', () => {
        render(
            <QueryState queries={[query(), query()]}>
                <p>Innhold</p>
            </QueryState>
        )

        expect(screen.getByText('Innhold')).toBeInTheDocument()
    })

    test('holds the layout with skeleton rows while any query is pending', () => {
        render(
            <QueryState queries={[query(), query({ isPending: true })]} skeletonRows={3}>
                <p>Innhold</p>
            </QueryState>
        )

        expect(screen.queryByText('Innhold')).not.toBeInTheDocument()
        // Announced rather than a silent swap — a skeleton says nothing on its own.
        const status = screen.getByRole('status', { name: 'Laster innhold' })
        expect(status).toHaveAttribute('aria-busy', 'true')
        // Placeholder rows are what hold the layout open.
        expect(status.children).toHaveLength(3)
    })

    test('reports an error instead of falling through to an empty-looking page', () => {
        render(
            <QueryState queries={[query({ isError: true })]}>
                <p>Ingen kamper registrert ennå</p>
            </QueryState>
        )

        // The bug this guards: a failed fetch used to render the empty state,
        // telling the user there is no data when the database was unreachable.
        expect(screen.queryByText('Ingen kamper registrert ennå')).not.toBeInTheDocument()
        expect(screen.getByRole('alert')).toHaveTextContent('Kunne ikke hente data')
    })

    test('error takes precedence over pending', () => {
        render(
            <QueryState queries={[query({ isPending: true }), query({ isError: true })]}>
                <p>Innhold</p>
            </QueryState>
        )

        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.queryByText('Laster innhold')).not.toBeInTheDocument()
    })

    test('retry refetches only the queries that failed', async () => {
        const ok = query()
        const broken = query({ isError: true })

        render(
            <QueryState queries={[ok, broken]}>
                <p>Innhold</p>
            </QueryState>
        )

        await userEvent.click(screen.getByRole('button', { name: 'Prøv igjen' }))

        expect(broken.refetch).toHaveBeenCalledOnce()
        expect(ok.refetch).not.toHaveBeenCalled()
    })
})
