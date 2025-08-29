import { Card, Button, TextInput } from '@fremtind/jokul'
import { useState } from 'react'
import { usePlayers } from '../hooks/usePlayers'

export function NewMatch() {
    const { data: players = [] } = usePlayers()
    const [player1Name, setPlayer1Name] = useState('')
    const [player2Name, setPlayer2Name] = useState('')
    const [player1Score, setPlayer1Score] = useState('')
    const [player2Score, setPlayer2Score] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!player1Name.trim() || !player2Name.trim() || !player1Score || !player2Score) {
            alert('Vennligst fyll ut alle felter')
            return
        }

        if (player1Name.trim().toLowerCase() === player2Name.trim().toLowerCase()) {
            alert('En spiller kan ikke spille mot seg selv')
            return
        }

        const p1Score = parseInt(player1Score)
        const p2Score = parseInt(player2Score)

        if (p1Score < 0 || p2Score < 0) {
            alert('Poeng kan ikke være negativt')
            return
        }

        // Standard ping pong rules: first to 11, must win by 2
        const minWinScore = 11
        const isValidScore = (winner: number, loser: number) => {
            if (winner < minWinScore) return false
            if (winner >= minWinScore && winner < 11 + 2) {
                return loser <= winner - 2
            }
            return winner > loser && winner - loser >= 2
        }

        if (p1Score > p2Score && !isValidScore(p1Score, p2Score)) {
            alert('Ugyldig poengsum. Første til 11, må vinne med minst 2 poeng.')
            return
        } else if (p2Score > p1Score && !isValidScore(p2Score, p1Score)) {
            alert('Ugyldig poengsum. Første til 11, må vinne med minst 2 poeng.')
            return
        } else if (p1Score === p2Score) {
            alert('Kampen kan ikke ende uavgjort')
            return
        }

        setIsSubmitting(true)

        // Here you would normally submit to an API
        // For now, just simulate success
        setTimeout(() => {
            alert('Kamp registrert!')
            setPlayer1Name('')
            setPlayer2Name('')
            setPlayer1Score('')
            setPlayer2Score('')
            setIsSubmitting(false)
        }, 1000)
    }

    return (
        <div className="py-6 mx-auto max-w-md px-4">
            <h1 className="text-2xl mb-6 text-center font-bold">Registrer ny kamp</h1>

            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <TextInput
                            label="Spiller 1"
                            value={player1Name}
                            onChange={(e) => setPlayer1Name(e.target.value)}
                            placeholder="Navn på spiller 1"
                        />
                    </div>

                    <div>
                        <TextInput
                            label="Spiller 2"
                            value={player2Name}
                            onChange={(e) => setPlayer2Name(e.target.value)}
                            placeholder="Navn på spiller 2"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <TextInput
                                label="Poeng spiller 1"
                                type="number"
                                value={player1Score}
                                onChange={(e) => setPlayer1Score(e.target.value)}
                                placeholder="0"
                                min="0"
                            />
                        </div>
                        <div>
                            <TextInput
                                label="Poeng spiller 2"
                                type="number"
                                value={player2Score}
                                onChange={(e) => setPlayer2Score(e.target.value)}
                                placeholder="0"
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                        <h3 className="font-medium text-sm mb-2">Regler:</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Første til 11 poeng vinner</li>
                            <li>• Må vinne med minst 2 poeng</li>
                            <li>• Tillitsbasert registrering</li>
                            <li>• Nye spillere opprettes automatisk</li>
                        </ul>
                    </div>

                    {players.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm font-medium mb-2">Eksisterende spillere:</p>
                            <div className="text-sm text-gray-600">
                                {players.map((player) => player.name).join(', ')}
                            </div>
                        </div>
                    )}

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? 'Registrerer...' : 'Registrer kamp'}
                    </Button>
                </form>
            </Card>
        </div>
    )
}
