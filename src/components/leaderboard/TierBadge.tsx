import type { CSSProperties } from 'react'
import { Tag } from '@fremtind/jokul/tag'
import { EloService } from '../../lib/eloService'

/**
 * Maps EloService.getRatingTier's `color` to the CSS variable holding that
 * tier's verified-contrast value (see the block in src/styles/global.scss).
 */
const TIER_COLOR_VAR: Record<ReturnType<typeof EloService.getRatingTier>['color'], string> = {
    bronze: 'var(--tier-bronze)',
    silver: 'var(--tier-silver)',
    gold: 'var(--tier-gold)',
    platinum: 'var(--tier-platinum)',
}

/**
 * @types/react's CSSProperties deliberately dropped its index signature, so a
 * custom-property key needs an explicit escape hatch rather than a suppression.
 */
type StyleWithCustomProperties = CSSProperties & Record<`--${string}`, string>

interface TierBadgeProps {
    rating: number
}

/**
 * A player's rating tier (Nybegynner/Ekspert/Mester/Stormester), coloured by
 * EloService.getRatingTier.
 *
 * Jøkul's base Tag ships four semantic fills (info/warning/error/success),
 * none of which mean bronze/silver/gold/platinum, so this overrides the
 * tag's own --background-color/--text-color custom properties directly
 * rather than picking a semantic variant that would misrepresent the tier.
 * A coloured border + coloured text on the tag's normal (unfilled-looking)
 * surface, not a filled metallic background — metallic hues read as pale
 * fills, and a fill tuned for light theme reads wrong in dark.
 */
export function TierBadge({ rating }: TierBadgeProps) {
    const { tier, color } = EloService.getRatingTier(rating)
    const tierColor = TIER_COLOR_VAR[color]

    const style: StyleWithCustomProperties = {
        '--background-color': 'transparent',
        '--text-color': tierColor,
        border: `1px solid ${tierColor}`,
    }

    return <Tag style={style}>{tier}</Tag>
}
