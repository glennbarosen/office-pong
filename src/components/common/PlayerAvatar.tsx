import type { Player } from '../../types/pong'
import { initialsForName } from '../../utils/gameUtils'

/**
 * Background/foreground pairs, each verified >= 4.5:1 contrast against its
 * white foreground text (computed via WCAG relative luminance, not
 * eyeballed — see the H5 accessibility work this follows the same bar as).
 * Fixed hex values rather than Jøkul tokens: the swatch has to look the same
 * regardless of theme, since it stands in for a specific person, not a piece
 * of themed chrome.
 */
const PALETTE = [
    '#1d4ed8', // blue
    '#7e22ce', // purple
    '#0f766e', // teal
    '#c2410c', // orange
    '#be185d', // pink
    '#4338ca', // indigo
    '#78350f', // brown
    '#334155', // slate
]

const SIZES = {
    sm: { diameter: 24, fontSize: 11 },
    lg: { diameter: 64, fontSize: 24 },
} as const

interface PlayerAvatarProps {
    player: Player
    size?: keyof typeof SIZES
}

/**
 * A player's picture, or a colour swatch with their initials when there is
 * none — which today is always, since nothing writes `players.avatar` yet.
 * Reading it here gives the column meaning without committing to the upload
 * question (where do files live on Dokku?) that's a separate conversation.
 *
 * Always `aria-hidden`: the player's name is rendered right next to every
 * usage, so the avatar itself carries no information a screen reader user
 * would otherwise miss.
 */
export function PlayerAvatar({ player, size = 'sm' }: PlayerAvatarProps) {
    const { diameter, fontSize } = SIZES[size]

    if (player.avatar) {
        return (
            <img
                src={player.avatar}
                alt=""
                aria-hidden="true"
                className="rounded-full object-cover"
                style={{ width: diameter, height: diameter }}
            />
        )
    }

    return (
        <span
            aria-hidden="true"
            className="text-white inline-flex shrink-0 items-center justify-center rounded-full font-bold"
            style={{
                width: diameter,
                height: diameter,
                fontSize,
                backgroundColor: colorForName(player.name),
            }}
        >
            {initialsForName(player.name)}
        </span>
    )
}

/**
 * Deterministic colour from the player's name, not their id — the id is
 * invisible to anyone using the app, so a player re-created with the same
 * name getting a different colour would look like a bug with no visible cause.
 *
 * Plain string hash (djb2), no crypto needed for a cosmetic assignment across
 * 8 buckets. Pure and synchronous, so it runs identically during SSR.
 */
function colorForName(name: string): string {
    let hash = 5381
    for (let i = 0; i < name.length; i++) {
        hash = (hash * 33) ^ name.charCodeAt(i)
    }
    const index = Math.abs(hash) % PALETTE.length
    return PALETTE[index] ?? PALETTE[0] ?? '#334155'
}
