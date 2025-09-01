import { Button } from '@fremtind/jokul/button'
import { Card } from '@fremtind/jokul/card'
import { NativeSelect } from '@fremtind/jokul/select'
import { TextInput } from '@fremtind/jokul/text-input'

export interface PlayerCardProps {
    playerNumber: 1 | 2
    playerType: 'existing' | 'new'
    playerId: string
    playerName: string
    playerScore: string
    playerOptions: Array<{ value: string; label: string }>
    onPlayerTypeChange: (type: 'existing' | 'new') => void
    onPlayerIdChange: (id: string) => void
    onPlayerNameChange: (name: string) => void
    onPlayerScoreChange: (score: string) => void
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
}: PlayerCardProps) {
    return (
        <Card variant="low" padding="xl">
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="heading-4 mb-2">Spiller {playerNumber}</h2>
                    <div className="flex gap-8">
                        <Button
                            variant={playerType === 'existing' ? 'primary' : 'secondary'}
                            density="compact"
                            type="button"
                            onClick={() => onPlayerTypeChange('existing')}
                        >
                            Eksisterende
                        </Button>
                        <Button
                            variant={playerType === 'new' ? 'primary' : 'secondary'}
                            density="compact"
                            type="button"
                            onClick={() => onPlayerTypeChange('new')}
                        >
                            Ny spiller
                        </Button>
                    </div>
                </div>

                {playerType === 'existing' ? (
                    <NativeSelect
                        name={`player${playerNumber}`}
                        items={playerOptions}
                        label="Velg spiller"
                        value={playerId}
                        onChange={(event) => onPlayerIdChange(event.target.value)}
                    />
                ) : (
                    <TextInput
                        name={`player${playerNumber}Name`}
                        label="Navn"
                        placeholder="Skriv inn navn på ny spiller..."
                        helpLabel="Bruk gjerne fornavn + etternavn for å unngå duplikater"
                        value={playerName}
                        onChange={(e) => onPlayerNameChange(e.target.value)}
                    />
                )}

                <TextInput
                    type="number"
                    name={`player${playerNumber}Score`}
                    label="Poeng"
                    placeholder="Skriv inn poeng"
                    value={playerScore}
                    onChange={(e) => onPlayerScoreChange(e.target.value)}
                />
            </div>
        </Card>
    )
}
