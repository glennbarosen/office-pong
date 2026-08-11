import { SuccessTag, ErrorTag } from '@fremtind/jokul/tag'
import type { MatchResult, PlayerForm } from '../../types/pong'

const RESULT_LABEL: Record<MatchResult, string> = { win: 'seier', loss: 'tap' }

interface FormIndicatorProps {
    /** Absent for a player createFormByPlayer never saw — nobody with 0 matches. */
    form: PlayerForm | undefined
}

/**
 * A player's last few results as coloured dots, plus their current streak.
 *
 * Colour alone is never the only signal (H5's rule): the dots are decorative
 * (`aria-hidden`) and the whole thing carries one `aria-label` spelling out
 * the same information as text. The dots read the same functional colour
 * tokens the charts do (see useThemeColors), but as a plain CSS custom
 * property rather than a resolved value — unlike Recharts' SVG attributes,
 * a DOM element can use var() directly, so no JS is needed to track the theme.
 */
export function FormIndicator({ form }: FormIndicatorProps) {
    if (!form || form.recent.length === 0) {
        return <span className="text-text-subdued">–</span>
    }

    const { recent, streak } = form
    const hasStreak = streak !== null && streak.count >= 2

    const resultsLabel = recent.map((result) => RESULT_LABEL[result]).join(', ')
    const streakLabel = hasStreak ? ` ${streak.count} ${streak.type === 'win' ? 'seire' : 'tap'} på rad.` : ''

    return (
        <span className="inline-flex items-center gap-8">
            <span
                aria-label={`Siste ${recent.length} kamper: ${resultsLabel}.${streakLabel}`}
                className="inline-flex gap-4"
            >
                {recent.map((result, index) => (
                    <span
                        // The list is derived fresh each render and never reordered, so an
                        // index key is safe.
                        key={index}
                        aria-hidden="true"
                        className="h-8 w-8 rounded-full"
                        style={{
                            backgroundColor: `var(--jkl-color-functional-${result === 'win' ? 'success' : 'error'})`,
                        }}
                    />
                ))}
            </span>
            {hasStreak &&
                (streak.type === 'win' ? (
                    <SuccessTag>{streak.count} seire på rad</SuccessTag>
                ) : (
                    <ErrorTag>{streak.count} tap på rad</ErrorTag>
                ))}
        </span>
    )
}
