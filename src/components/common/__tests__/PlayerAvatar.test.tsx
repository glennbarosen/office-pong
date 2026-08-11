import { describe, test, expect } from 'vitest'
import { render, within } from '@testing-library/react'
import { PlayerAvatar } from '../PlayerAvatar'
import { RATING_CONFIG, type Player } from '../../../types/pong'

const makePlayer = (overrides: Partial<Player> & { id: string; name: string }): Player => ({
    eloRating: RATING_CONFIG.STARTING_ELO,
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
})

describe('PlayerAvatar', () => {
    test('renders initials when the player has no avatar image', () => {
        const { getByText } = render(<PlayerAvatar player={makePlayer({ id: '1', name: 'Ada Lovelace' })} />)

        expect(getByText('AL')).toBeInTheDocument()
    })

    test('renders the avatar image when the player has one, not initials', () => {
        // The <img> is aria-hidden (see the component's own comment on why),
        // so it has no accessible role to query by — go through the DOM.
        const { container, queryByText } = render(
            <PlayerAvatar player={makePlayer({ id: '1', name: 'Ada Lovelace', avatar: 'https://example.com/a.png' })} />
        )

        expect(container.querySelector('img')).toHaveAttribute('src', 'https://example.com/a.png')
        expect(queryByText('AL')).not.toBeInTheDocument()
    })

    test('is hidden from the accessibility tree — the adjacent name carries the info', () => {
        const { container } = render(<PlayerAvatar player={makePlayer({ id: '1', name: 'Ada Lovelace' })} />)

        expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull()
    })

    test('assigns the same background colour to the same name every render', () => {
        // Scoped to each render's own container: both mount "AL" into the
        // shared document body, so an unscoped getByText would see both.
        const player = makePlayer({ id: '1', name: 'Ada Lovelace' })
        const first = render(<PlayerAvatar player={player} />)
        const second = render(<PlayerAvatar player={player} />)

        const firstColor = getComputedStyle(within(first.container).getByText('AL')).backgroundColor
        const secondColor = getComputedStyle(within(second.container).getByText('AL')).backgroundColor

        expect(firstColor).toBe(secondColor)
    })

    test('assigns a colour independent of id, so a re-created player keeps the same one', () => {
        const first = render(<PlayerAvatar player={makePlayer({ id: 'old-id', name: 'Ada Lovelace' })} />)
        const second = render(<PlayerAvatar player={makePlayer({ id: 'new-id', name: 'Ada Lovelace' })} />)

        const firstColor = getComputedStyle(within(first.container).getByText('AL')).backgroundColor
        const secondColor = getComputedStyle(within(second.container).getByText('AL')).backgroundColor

        expect(firstColor).toBe(secondColor)
    })
})
