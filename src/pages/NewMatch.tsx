import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { usePlayers, useAddPlayer } from '../hooks/usePlayers'
import { useAddMatchWithEloUpdates } from '../hooks/useMatches'
import { MatchService, type MatchCreationData } from '../lib/matchService'
import { parseInteger } from '../utils/gameUtils'
import { Button } from '@fremtind/jokul/button'
import { Card } from '@fremtind/jokul/card'
import { NativeSelect } from '@fremtind/jokul/select'
import { TextInput } from '@fremtind/jokul/text-input'
import { InfoMessage } from '@fremtind/jokul/message'

export default function NewMatch() {
    const navigate = useNavigate()
    const { data: players = [] } = usePlayers()
    const addMatch = useAddMatchWithEloUpdates()
    const addPlayer = useAddPlayer()

    const [player1Type, setPlayer1Type] = useState<'existing' | 'new'>('existing')
    const [player2Type, setPlayer2Type] = useState<'existing' | 'new'>('existing')
    const [player1Id, setPlayer1Id] = useState('')
    const [player2Id, setPlayer2Id] = useState('')
    const [player1Name, setPlayer1Name] = useState('')
    const [player2Name, setPlayer2Name] = useState('')
    const [player1Score, setPlayer1Score] = useState('')
    const [player2Score, setPlayer2Score] = useState('')
    const [error, setError] = useState('')

    const playerOptions = players.map((player) => ({
        value: player.id,
        label: player.name,
    }))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        const score1 = parseInteger(player1Score)
        const score2 = parseInteger(player2Score)

        try {
            const matchCreationData: MatchCreationData = {
                player1Type,
                player2Type,
                player1Id,
                player2Id,
                player1Name,
                player2Name,
                player1Score: score1,
                player2Score: score2,
            }

            const processedMatch = await MatchService.processMatchCreation(
                matchCreationData,
                players,
                addPlayer.mutateAsync
            )

            await addMatch.mutateAsync(processedMatch)
            navigate({ to: '/' })
        } catch (error) {
            console.error('Error creating match:', error)
            setError(error instanceof Error ? error.message : 'Kunne ikke registrere kamp')
        }
    }

    return (
        <div className="space-y-24">
            <h1 className="heading-2 mb-2">Registrer ny kamp</h1>

            <InfoMessage title="Tillitsbasert system" className="mb-6">
                Vi stoler på at du registrerer kampen ærlig. Systemet krever minimum 5 kamper for å være kvalifisert for
                ledertavlen.
            </InfoMessage>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Player Cards */}
                <div className="grid gap-8 md:grid-cols-2 md:gap-12">
                    {/* Player 1 Card */}
                    <Card variant="low" padding="xl">
                        <div className="space-y-6">
                            <div className="text-center">
                                <h2 className="heading-4 mb-2">Spiller 1</h2>
                                <div className="flex gap-2">
                                    <Button
                                        variant={player1Type === 'existing' ? 'primary' : 'secondary'}
                                        density="compact"
                                        type="button"
                                        onClick={() => setPlayer1Type('existing')}
                                    >
                                        Eksisterende
                                    </Button>
                                    <Button
                                        variant={player1Type === 'new' ? 'primary' : 'secondary'}
                                        density="compact"
                                        type="button"
                                        onClick={() => setPlayer1Type('new')}
                                    >
                                        Ny spiller
                                    </Button>
                                </div>
                            </div>

                            {player1Type === 'existing' ? (
                                <NativeSelect
                                    name="player1"
                                    items={playerOptions}
                                    label="Velg spiller"
                                    onChange={(event) => setPlayer1Id(event.target.value)}
                                    style={{ overflowY: 'visible' }}
                                />
                            ) : (
                                <TextInput
                                    name="player1Name"
                                    label="Navn"
                                    placeholder="Skriv inn navn på ny spiller..."
                                    value={player1Name}
                                    onChange={(e) => setPlayer1Name(e.target.value)}
                                />
                            )}

                            <TextInput
                                type="number"
                                name="player1Score"
                                label="Poeng"
                                value={player1Score}
                                onChange={(e) => setPlayer1Score(e.target.value)}
                            />
                        </div>
                    </Card>

                    {/* Player 2 Card */}
                    <Card variant="low" padding="xl" className="overflow-y-visible">
                        <div className="space-y-6">
                            <div className="text-center">
                                <h2 className="heading-4 mb-2">Spiller 2</h2>
                                <div className="flex gap-2">
                                    <Button
                                        variant={player2Type === 'existing' ? 'primary' : 'secondary'}
                                        density="compact"
                                        type="button"
                                        onClick={() => setPlayer2Type('existing')}
                                    >
                                        Eksisterende
                                    </Button>
                                    <Button
                                        variant={player2Type === 'new' ? 'primary' : 'secondary'}
                                        density="compact"
                                        type="button"
                                        onClick={() => setPlayer2Type('new')}
                                    >
                                        Ny spiller
                                    </Button>
                                </div>
                            </div>

                            {player2Type === 'existing' ? (
                                <NativeSelect
                                    name="player2"
                                    items={playerOptions}
                                    label="Velg spiller"
                                    onChange={(event) => setPlayer2Id(event.target.value)}
                                />
                            ) : (
                                <TextInput
                                    name="player2Name"
                                    label="Navn"
                                    placeholder="Skriv inn navn på ny spiller..."
                                    value={player2Name}
                                    onChange={(e) => setPlayer2Name(e.target.value)}
                                />
                            )}

                            <TextInput
                                type="number"
                                name="player2Score"
                                label="Poeng"
                                value={player2Score}
                                onChange={(e) => setPlayer2Score(e.target.value)}
                                className="text-center"
                            />
                        </div>
                    </Card>
                </div>

                {/* Error Display */}
                {error && (
                    <Card variant="low" padding="l" className="bg-background-alert-error">
                        <p className="small text-center text-text-on-alert">{error}</p>
                    </Card>
                )}

                {/* Actions */}
                <div className="flex gap-12">
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={addMatch.isPending}
                        loader={
                            addMatch.isPending ? { showLoader: true, textDescription: 'Registrerer...' } : undefined
                        }
                    >
                        Registrer kamp
                    </Button>
                    <Button variant="tertiary" type="button" onClick={() => navigate({ to: '/' })}>
                        Avbryt
                    </Button>
                </div>
            </form>
        </div>
    )
}
