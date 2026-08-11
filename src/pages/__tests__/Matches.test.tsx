import { describe, test, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '../../test/renderWithProviders'
import { Matches } from '../Matches'
import type { Match, Player } from '../../types/pong'

const ada: Player = {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    name: 'Ada',
    eloRating: 1216,
    matchesPlayed: 1,
    wins: 1,
    losses: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
}

const grace: Player = {
    id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    name: 'Grace',
    eloRating: 1184,
    matchesPlayed: 1,
    wins: 0,
    losses: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
}

const baseMatch: Omit<Match, 'id' | 'eloChanges'> = {
    player1Id: ada.id,
    player2Id: grace.id,
    winnerId: ada.id,
    loserId: grace.id,
    player1Score: 11,
    player2Score: 5,
    playedAt: '2026-03-14T09:05:00.000Z',
}

const mockMatches = vi.hoisted(() => vi.fn())
const mockPlayers = vi.hoisted(() => vi.fn())

vi.mock('../../hooks/useMatches', () => ({ useMatches: mockMatches }))
vi.mock('../../hooks/usePlayers', () => ({ usePlayers: mockPlayers }))

function arrange(matches: Match[]) {
    mockMatches.mockReturnValue({ data: matches, isLoading: false })
    mockPlayers.mockReturnValue({ data: [ada, grace], isLoading: false })
}

describe('Matches page — ELO change column', () => {
    test('shows the recorded change with an explicit sign', async () => {
        arrange([{ ...baseMatch, id: 'match-1', eloChanges: { [ada.id]: 16, [grace.id]: -16 } }])

        await renderWithProviders(<Matches />)

        expect(screen.getByText('Ada: +16')).toBeInTheDocument()
        expect(screen.getByText('Grace: -16')).toBeInTheDocument()
    })

    test('renders a dash, not NaN, for a row with no recorded change', async () => {
        // Rows written before ELO changes were persisted keep the schema default
        // '{}'::jsonb. These used to render "+NaN".
        arrange([{ ...baseMatch, id: 'match-2', eloChanges: {} }])

        await renderWithProviders(<Matches />)

        expect(screen.getByText('Ada: –')).toBeInTheDocument()
        expect(screen.getByText('Grace: –')).toBeInTheDocument()
        expect(screen.queryByText(/NaN/)).not.toBeInTheDocument()
    })
})
