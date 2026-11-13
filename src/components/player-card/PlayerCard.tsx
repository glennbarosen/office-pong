import { Card } from '@fremtind/jokul/card'
import { SegmentedControl } from '@fremtind/jokul/segmented-control'
import { SegmentedControlButton } from '@fremtind/jokul/segmented-control-button'
import { NativeSelect } from '@fremtind/jokul/select'
import { TextInput } from '@fremtind/jokul/text-input'
import type { Player, SelectOption } from '../../types'
import { PlayerAvatar } from '../common/PlayerAvatar'

export interface PlayerCardProps {
    playerNumber: 1 | 2
    playerType: 'existing' | 'new'
    playerId: string
    playerName: string
    playerScore: string
    playerOptions: SelectOption[]
    /** The chosen existing player, for the avatar preview. */
    selectedPlayer?: Player
    onPlayerTypeChange: (type: 'existing' | 'new') => void
    onPlayerIdChange: (id: string) => void
    onPlayerNameChange: (name: string) => void
    onPlayerScoreChange: (score: string) => void
    /**
     * The submit failed validation. The server reports one message for the
     * whole form rather than per field, so both inputs are marked rather than
     * guessing which one is at fault.
     */
    hasError?: boolean
}

/** Stands in for a player who has not been picked or named yet. */
const PLACEHOLDER: Player = {
    id: '',
    name: '?',
    eloRating: 0,
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    createdAt: '',
}

export function PlayerCard({
    playerNumber,
    playerType,
    playerId,
    playerName,
    playerScore,
    playerOptions,
    selectedPlayer,
    onPlayerTypeChange,
    onPlayerIdChange,
    onPlayerNameChange,
    onPlayerScoreChange,
    hasError = false,
}: PlayerCardProps) {
    const previewName = playerType === 'existing' ? selectedPlayer?.name : playerName.trim()
    const preview = playerType === 'existing' ? selectedPlayer : { ...PLACEHOLDER, name: previewName || '?' }

    return (
        <Card variant="low" padding="l" className="flex h-full flex-col gap-24">
            <div className="flex items-center gap-12">
                <PlayerAvatar player={preview ?? PLACEHOLDER} size="md" />
                <div className="min-w-0">
                    <h2 className="small font-bold uppercase tracking-wider text-text-subdued">
                        Spiller {playerNumber}
                    </h2>
                    <p className="heading-4 truncate">{previewName || 'Velg spiller'}</p>
                </div>
            </div>

            {/* A real radio group, not two buttons whose selected state was
                conveyed by colour alone. The legend is visually hidden because
                the heading above already says which player this is. */}
            <SegmentedControl
                legend={`Spiller ${playerNumber}: eksisterende eller ny`}
                labelProps={{ srOnly: true }}
                density="compact"
            >
                <SegmentedControlButton
                    name={`player${playerNumber}Type`}
                    value="existing"
                    checked={playerType === 'existing'}
                    onChange={() => onPlayerTypeChange('existing')}
                >
                    Eksisterende
                </SegmentedControlButton>
                <SegmentedControlButton
                    name={`player${playerNumber}Type`}
                    value="new"
                    checked={playerType === 'new'}
                    onChange={() => onPlayerTypeChange('new')}
                >
                    Ny spiller
                </SegmentedControlButton>
            </SegmentedControl>

            {playerType === 'existing' ? (
                <NativeSelect
                    name={`player${playerNumber}`}
                    items={playerOptions}
                    label="Velg spiller"
                    width="100%"
                    value={playerId}
                    onChange={(event) => onPlayerIdChange(event.target.value)}
                    aria-invalid={hasError || undefined}
                />
            ) : (
                <TextInput
                    name={`player${playerNumber}Name`}
                    label="Navn"
                    placeholder="Fornavn Etternavn"
                    helpLabel="Bruk gjerne fornavn + etternavn for å unngå duplikater"
                    value={playerName}
                    onChange={(e) => onPlayerNameChange(e.target.value)}
                    aria-invalid={hasError || undefined}
                />
            )}

            <TextInput
                className="score-input mt-auto"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                name={`player${playerNumber}Score`}
                label="Poeng"
                placeholder="0"
                value={playerScore}
                onChange={(e) => onPlayerScoreChange(e.target.value.replace(/\D/g, ''))}
                aria-invalid={hasError || undefined}
            />
        </Card>
    )
}
