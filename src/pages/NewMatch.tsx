import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { usePlayers, useAddPlayer } from '../hooks/usePlayers'
import { useAddMatch } from '../hooks/useMatches'
import { RATING_CONFIG } from '../types/pong'
import { Button } from '@fremtind/jokul/button'
import { Card } from '@fremtind/jokul/card'
import { NativeSelect } from '@fremtind/jokul/select'
import { TextInput } from '@fremtind/jokul/text-input'
import { InfoMessage } from '@fremtind/jokul/message'

export default function NewMatch() {
    const navigate = useNavigate()
    const { data: players = [] } = usePlayers()
    const addMatch = useAddMatch()
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

        const score1 = parseInt(player1Score)
        const score2 = parseInt(player2Score)

        if (isNaN(score1) || isNaN(score2)) {
            setError('Vennligst skriv inn gyldige poengsum')
            return
        }

        if (score1 < 0 || score2 < 0) {
            setError('Poengsum kan ikke være negative')
            return
        }

        if (Math.max(score1, score2) < 11) {
            setError('Minst én spiller må ha 11 poeng eller mer for å vinne')
            return
        }

        if (score1 === score2) {
            setError('Kampen kan ikke ende uavgjort - én spiller må vinne')
            return
        }

        try {
            // Get or create player 1
            let finalPlayer1Id = player1Id
            let finalPlayer1Name = ''

            if (player1Type === 'new') {
                if (!player1Name.trim()) {
                    setError('Vennligst skriv inn navn for spiller 1')
                    return
                }

                const newPlayer1 = await addPlayer.mutateAsync({
                    name: player1Name.trim(),
                    eloRating: RATING_CONFIG.STARTING_ELO,
                    matchesPlayed: 0,
                    wins: 0,
                    losses: 0,
                    createdAt: new Date().toISOString(),
                })

                finalPlayer1Id = newPlayer1.id
                finalPlayer1Name = newPlayer1.name
            } else {
                const existingPlayer1 = players.find((p) => p.id === player1Id)
                if (!existingPlayer1) {
                    setError('Vennligst velg spiller 1')
                    return
                }
                finalPlayer1Name = existingPlayer1.name
            }

            // Get or create player 2
            let finalPlayer2Id = player2Id
            let finalPlayer2Name = ''

            if (player2Type === 'new') {
                if (!player2Name.trim()) {
                    setError('Vennligst skriv inn navn for spiller 2')
                    return
                }

                const newPlayer2 = await addPlayer.mutateAsync({
                    name: player2Name.trim(),
                    eloRating: RATING_CONFIG.STARTING_ELO,
                    matchesPlayed: 0,
                    wins: 0,
                    losses: 0,
                    createdAt: new Date().toISOString(),
                })

                finalPlayer2Id = newPlayer2.id
                finalPlayer2Name = newPlayer2.name
            } else {
                const existingPlayer2 = players.find((p) => p.id === player2Id)
                if (!existingPlayer2) {
                    setError('Vennligst velg spiller 2')
                    return
                }
                finalPlayer2Name = existingPlayer2.name
            }

            if (finalPlayer1Name === finalPlayer2Name) {
                setError('Spillerne må være forskjellige')
                return
            }

            // Create the match
            await addMatch.mutateAsync({
                player1Id: finalPlayer1Id,
                player2Id: finalPlayer2Id,
                winnerId: score1 > score2 ? finalPlayer1Id : finalPlayer2Id,
                loserId: score1 > score2 ? finalPlayer2Id : finalPlayer1Id,
                player1Score: score1,
                player2Score: score2,
                playedAt: new Date().toISOString(),
                eloChanges: {
                    [finalPlayer1Id]: 0, // You might want to calculate ELO changes
                    [finalPlayer2Id]: 0,
                },
            })

            navigate({ to: '/' })
        } catch (error) {
            console.error('Error creating match:', error)
            setError('Kunne ikke registrere kamp')
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
