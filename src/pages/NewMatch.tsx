import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { usePlayers } from '../hooks/usePlayers'
import { useCreateMatch } from '../hooks/useMatches'
import { RATING_CONFIG, type Player } from '../types/pong'
import { MatchService, type MatchCreationData } from '../lib/matchService'
import { EloService } from '../lib/eloService'
import { formatEloChange, parseInteger } from '../utils/gameUtils'
import { triggerMatchSuccessConfetti } from '../utils/confetti'
import { PlayerCard } from '../components/player-card/PlayerCard'
import { Button } from '@fremtind/jokul/button'
import { ErrorMessage } from '@fremtind/jokul/message'
import { QueryState } from '../components/common/QueryState'
import { PageHeader } from '../components/layout/PageHeader'

interface Preview {
    winnerName: string
    loserName: string
    winnerChange: number
    loserChange: number
}

/**
 * What submitting would record, or null while the form is not yet valid.
 *
 * Display only — runs the same validation the submit does, and the same
 * EloService the server uses, but the server recomputes everything from the
 * ratings it has at commit time, so this is an estimate.
 */
function previewMatch(data: MatchCreationData, players: Player[]): Preview | null {
    try {
        const input = MatchService.validateMatchCreation(data, players)
        const asPlayer = (ref: typeof input.player1): Player =>
            ref.type === 'existing'
                ? (players.find((player) => player.id === ref.id) as Player)
                : {
                      id: '',
                      name: ref.name,
                      eloRating: RATING_CONFIG.STARTING_ELO,
                      matchesPlayed: 0,
                      wins: 0,
                      losses: 0,
                      createdAt: '',
                  }
        const p1 = asPlayer(input.player1)
        const p2 = asPlayer(input.player2)
        const [winner, loser] = input.player1Score > input.player2Score ? [p1, p2] : [p2, p1]
        const { winnerChange, loserChange } = EloService.calculateEloChanges(winner, loser)
        return { winnerName: winner.name, loserName: loser.name, winnerChange, loserChange }
    } catch {
        return null
    }
}

export function NewMatch() {
    const navigate = useNavigate()
    const playersQuery = usePlayers()
    const players = playersQuery.data ?? []
    const createMatch = useCreateMatch()

    const [player1Type, setPlayer1Type] = useState<'existing' | 'new'>('existing')
    const [player2Type, setPlayer2Type] = useState<'existing' | 'new'>('existing')
    const [player1Id, setPlayer1Id] = useState('')
    const [player2Id, setPlayer2Id] = useState('')
    const [player1Name, setPlayer1Name] = useState('')
    const [player2Name, setPlayer2Name] = useState('')
    const [player1Score, setPlayer1Score] = useState('')
    const [player2Score, setPlayer2Score] = useState('')
    const [error, setError] = useState('')
    const errorRef = useRef<HTMLDivElement>(null)

    // Move focus to the error when a submit fails, so a keyboard or screen
    // reader user is taken to the problem instead of being left on the button
    // with nothing announced.
    useEffect(() => {
        if (error) errorRef.current?.focus()
    }, [error])

    const playerOptions = players.map((player) => ({
        value: player.id,
        label: player.name,
    }))

    // Filter out selected players to prevent duplicate selection
    const player1Options = playerOptions.filter((option) => option.value !== player2Id)
    const player2Options = playerOptions.filter((option) => option.value !== player1Id)

    const matchCreationData: MatchCreationData = {
        player1Type,
        player2Type,
        player1Id,
        player2Id,
        player1Name,
        player2Name,
        player1Score: parseInteger(player1Score),
        player2Score: parseInteger(player2Score),
    }
    const preview = player1Score && player2Score ? previewMatch(matchCreationData, players) : null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        try {
            // Validate here for immediate feedback; the server validates again
            // and does every insert in one transaction.
            const matchInput = MatchService.validateMatchCreation(matchCreationData, players)

            await createMatch.mutateAsync(matchInput)

            triggerMatchSuccessConfetti(() => {
                void navigate({ to: '/' })
            })
        } catch (error) {
            console.error('Error creating match:', error)
            setError(error instanceof Error ? error.message : 'Kunne ikke registrere kamp')
        }
    }

    return (
        <div>
            <PageHeader
                title="Registrer kamp"
                subtitle={`Første til 11, vinn med to. Vi stoler på at du registrerer ærlig — ${RATING_CONFIG.MINIMUM_MATCHES_FOR_RANKING} kamper gir plass på tavla.`}
            />

            <QueryState queries={[playersQuery]} skeletonRows={3}>
                <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-24">
                    <div className="grid items-stretch gap-12 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-16">
                        <PlayerCard
                            playerNumber={1}
                            playerType={player1Type}
                            playerId={player1Id}
                            playerName={player1Name}
                            playerScore={player1Score}
                            playerOptions={player1Options}
                            selectedPlayer={players.find((player) => player.id === player1Id)}
                            onPlayerTypeChange={setPlayer1Type}
                            onPlayerIdChange={setPlayer1Id}
                            onPlayerNameChange={setPlayer1Name}
                            onPlayerScoreChange={setPlayer1Score}
                            hasError={Boolean(error)}
                        />

                        <div className="flex items-center justify-center" aria-hidden="true">
                            <span className="small flex h-40 w-40 items-center justify-center rounded-full border border-solid border-border-separator font-bold text-text-subdued">
                                VS
                            </span>
                        </div>

                        <PlayerCard
                            playerNumber={2}
                            playerType={player2Type}
                            playerId={player2Id}
                            playerName={player2Name}
                            playerScore={player2Score}
                            playerOptions={player2Options}
                            selectedPlayer={players.find((player) => player.id === player2Id)}
                            onPlayerTypeChange={setPlayer2Type}
                            onPlayerIdChange={setPlayer2Id}
                            onPlayerNameChange={setPlayer2Name}
                            onPlayerScoreChange={setPlayer2Score}
                            hasError={Boolean(error)}
                        />
                    </div>

                    {/* Polite: it updates on every keystroke and must not
                        interrupt typing the score. */}
                    <div aria-live="polite" className="min-h-24">
                        {preview && (
                            <p className="body text-center">
                                <strong>{preview.winnerName}</strong> vinner ·{' '}
                                <span className="tabular text-delta-up">{formatEloChange(preview.winnerChange)}</span>
                                {' / '}
                                <span className="tabular text-delta-down">
                                    {formatEloChange(preview.loserChange)}
                                </span>{' '}
                                <span className="text-text-subdued">ELO (ca.)</span>
                            </p>
                        )}
                    </div>

                    <div role="alert" aria-live="assertive">
                        {error && (
                            <ErrorMessage ref={errorRef} tabIndex={-1}>
                                {error}
                            </ErrorMessage>
                        )}
                    </div>

                    <div className="flex flex-wrap justify-center gap-12">
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={createMatch.isPending}
                            loader={
                                createMatch.isPending
                                    ? { showLoader: true, textDescription: 'Registrerer...' }
                                    : undefined
                            }
                        >
                            Registrer kamp
                        </Button>
                        <Button variant="ghost" type="button" onClick={() => void navigate({ to: '/' })}>
                            Avbryt
                        </Button>
                    </div>
                </form>
            </QueryState>
        </div>
    )
}
