import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { usePlayers, useAddPlayer } from '../hooks/usePlayers'
import { useAddMatchWithEloUpdates } from '../hooks/useMatches'
import { MatchService, type MatchCreationData } from '../lib/matchService'
import { parseInteger } from '../utils/gameUtils'
import { triggerMatchSuccessConfetti } from '../utils/confetti'
import { PlayerCard } from '../components'
import { Button } from '@fremtind/jokul/button'
import { ErrorMessage, InfoMessage } from '@fremtind/jokul/message'

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

    // Filter out selected players to prevent duplicate selection
    const player1Options = playerOptions.filter((option) => option.value !== player2Id)
    const player2Options = playerOptions.filter((option) => option.value !== player1Id)

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

            // Trigger extreme celebratory confetti animation
            triggerMatchSuccessConfetti(() => {
                navigate({ to: '/' })
            })
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
                    <PlayerCard
                        playerNumber={1}
                        playerType={player1Type}
                        playerId={player1Id}
                        playerName={player1Name}
                        playerScore={player1Score}
                        playerOptions={player1Options}
                        onPlayerTypeChange={setPlayer1Type}
                        onPlayerIdChange={setPlayer1Id}
                        onPlayerNameChange={setPlayer1Name}
                        onPlayerScoreChange={setPlayer1Score}
                    />

                    <PlayerCard
                        playerNumber={2}
                        playerType={player2Type}
                        playerId={player2Id}
                        playerName={player2Name}
                        playerScore={player2Score}
                        playerOptions={player2Options}
                        onPlayerTypeChange={setPlayer2Type}
                        onPlayerIdChange={setPlayer2Id}
                        onPlayerNameChange={setPlayer2Name}
                        onPlayerScoreChange={setPlayer2Score}
                    />
                </div>

                {/* Error Display */}
                {error && <ErrorMessage>{error}</ErrorMessage>}

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
