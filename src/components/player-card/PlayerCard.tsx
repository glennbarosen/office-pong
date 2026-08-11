import { Card } from '@fremtind/jokul/card'
import { SegmentedControl } from '@fremtind/jokul/segmented-control'
import { SegmentedControlButton } from '@fremtind/jokul/segmented-control-button'
import { NativeSelect } from '@fremtind/jokul/select'
import { TextInput } from '@fremtind/jokul/text-input'
import type { SelectOption } from '../../types'

export interface PlayerCardProps {
    playerNumber: 1 | 2
    playerType: 'existing' | 'new'
    playerId: string
    playerName: string
    playerScore: string
    playerOptions: SelectOption[]
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

export function PlayerCard({
    playerNumber,
    playerType,
    playerId,
    playerName,
    playerScore,
    playerOptions,
    onPlayerTypeChange,
    onPlayerIdChange,
    onPlayerNameChange,
    onPlayerScoreChange,
    hasError = false,
}: PlayerCardProps) {
    return (
        <Card variant="low" padding="xl">
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="heading-4 mb-2">Spiller {playerNumber}</h2>
                    {/* A real radio group, not two buttons whose selected state
                        was conveyed by colour alone. The legend is visually
                        hidden because the heading above already says which
                        player this is; screen readers still get the grouping. */}
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
                </div>

                {playerType === 'existing' ? (
                    <NativeSelect
                        name={`player${playerNumber}`}
                        items={playerOptions}
                        label="Velg spiller"
                        value={playerId}
                        onChange={(event) => onPlayerIdChange(event.target.value)}
                        aria-invalid={hasError || undefined}
                    />
                ) : (
                    <TextInput
                        name={`player${playerNumber}Name`}
                        label="Navn"
                        placeholder="Skriv inn navn på ny spiller..."
                        helpLabel="Bruk gjerne fornavn + etternavn for å unngå duplikater"
                        value={playerName}
                        onChange={(e) => onPlayerNameChange(e.target.value)}
                        aria-invalid={hasError || undefined}
                    />
                )}

                <TextInput
                    type="number"
                    name={`player${playerNumber}Score`}
                    label="Poeng"
                    placeholder="Skriv inn poeng"
                    value={playerScore}
                    onChange={(e) => onPlayerScoreChange(e.target.value)}
                    aria-invalid={hasError || undefined}
                />
            </div>
        </Card>
    )
}
