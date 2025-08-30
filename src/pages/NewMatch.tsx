import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button, TextInput, Select } from '@fremtind/jokul'
import { usePlayers } from '../hooks/usePlayers'
import { useAddMatch } from '../hooks/useMatches'

export default function NewMatch() {
    const navigate = useNavigate()
    const { data: players = [] } = usePlayers()
    const addMatch = useAddMatch()

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const score1 = parseInt(player1Score)
        const score2 = parseInt(player2Score)

        if (isNaN(score1) || isNaN(score2)) {
            setError('Vennligst skriv inn gyldige poengsum')
            return
        }

        // Determine player names and IDs
        const finalPlayer1Name =
            player1Type === 'new' ? player1Name : players.find((p) => p.id === player1Id)?.name || ''
        const finalPlayer2Name =
            player2Type === 'new' ? player2Name : players.find((p) => p.id === player2Id)?.name || ''

        const finalPlayer1Id = player1Type === 'new' ? `player-${Date.now()}-1` : player1Id
        const finalPlayer2Id = player2Type === 'new' ? `player-${Date.now()}-2` : player2Id

        if (!finalPlayer1Name || !finalPlayer2Name) {
            setError('Vennligst velg eller skriv inn spillernavn')
            return
        }

        if (finalPlayer1Name === finalPlayer2Name) {
            setError('Spillerne må være forskjellige')
            return
        }

        addMatch.mutate(
            {
                player1Id: finalPlayer1Id,
                player2Id: finalPlayer2Id,
                winnerId: score1 > score2 ? finalPlayer1Id : finalPlayer2Id,
                loserId: score1 > score2 ? finalPlayer2Id : finalPlayer1Id,
                player1Score: score1,
                player2Score: score2,
                playedAt: new Date().toISOString(),
                eloChanges: {}, // This would be calculated by the backend
            },
            {
                onSuccess: () => {
                    navigate({ to: '/' })
                },
                onError: () => {
                    setError('Kunne ikke registrere kamp')
                },
            }
        )
    }

    return (
        <div className="py-6 mx-auto max-w-md px-4">
            <div className="space-y-6">
                <h2 className="heading-4">Registrer ny kamp</h2>

                <div className="p-3 rounded-lg bg-background-alert-info">
                    <p className="small text-text-on-alert">
                        <strong>Tillitsbasert system:</strong> Vi stoler på at du registrerer kampen ærlig. Systemet
                        krever minimum 5 kamper for å være kvalifisert for ranglisten.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Player 1 */}
                    <div>
                        <label className="small mb-2 block text-text-default">Spiller 1</label>
                        <div className="mb-2 flex gap-2">
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

                        {player1Type === 'existing' ? (
                            <Select
                                name="player1"
                                items={playerOptions}
                                label=""
                                onChange={(event) => setPlayer1Id(event.target.value)}
                            />
                        ) : (
                            <TextInput
                                name="player1Name"
                                label=""
                                placeholder="Navn på ny spiller..."
                                value={player1Name}
                                onChange={(e) => setPlayer1Name(e.target.value)}
                            />
                        )}
                    </div>

                    {/* Player 2 */}
                    <div>
                        <label className="small mb-2 block text-text-default">Spiller 2</label>
                        <div className="mb-2 flex gap-2">
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

                        {player2Type === 'existing' ? (
                            <Select
                                name="player2"
                                items={playerOptions}
                                label=""
                                onChange={(event) => setPlayer2Id(event.target.value)}
                            />
                        ) : (
                            <TextInput
                                name="player2Name"
                                label=""
                                placeholder="Navn på ny spiller..."
                                value={player2Name}
                                onChange={(e) => setPlayer2Name(e.target.value)}
                            />
                        )}
                    </div>

                    {/* Scores */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 small block text-text-default">Poeng spiller 1</label>
                            <TextInput
                                type="number"
                                name="player1Score"
                                label=""
                                placeholder="0"
                                value={player1Score}
                                onChange={(e) => setPlayer1Score(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="mb-1 small block text-text-default">Poeng spiller 2</label>
                            <TextInput
                                type="number"
                                name="player2Score"
                                label=""
                                placeholder="0"
                                value={player2Score}
                                onChange={(e) => setPlayer2Score(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && <div className="small text-text-on-alert">{error}</div>}

                    <div className="gap-3 flex pt-4">
                        <Button
                            type="submit"
                            disabled={addMatch.isPending}
                            loader={
                                addMatch.isPending ? { showLoader: true, textDescription: 'Registrerer...' } : undefined
                            }
                        >
                            Registrer kamp
                        </Button>
                        <Button variant="secondary" type="button" onClick={() => navigate({ to: '/' })}>
                            Avbryt
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
