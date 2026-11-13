import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from '@fremtind/jokul/button'
import { Card } from '@fremtind/jokul/card'
import { ErrorMessage } from '@fremtind/jokul/message'
import { TextInput } from '@fremtind/jokul/text-input'
import { usePlayers } from '../hooks/usePlayers'
import { useMatches } from '../hooks/useMatches'
import { useEndTournament, useStartTournament, useTournaments } from '../hooks/useTournaments'
import { tournamentNameSchema } from '../lib/validation'
import type { Match, Player, Tournament as TournamentType } from '../types/pong'
import {
    createPlayerMap,
    createTournamentStandings,
    findActiveTournament,
    formatDate,
    resolveMatchPlayers,
} from '../utils/gameUtils'
import { QueryState } from '../components/common/QueryState'
import { PageHeader } from '../components/layout/PageHeader'
import { SectionHeader } from '../components/layout/SectionHeader'
import { MatchCard } from '../components/match-card/MatchCard'
import { PlayerAvatar } from '../components/common/PlayerAvatar'
import { StatGrid, StatTile } from '../components/common/StatTile'

/**
 * Tournaments: start one, tag matches to it from "Ny kamp", end it.
 *
 * The draw happens outside the app, so there is no bracket — the page shows
 * the tournament's matches and, since it is a knockout, who is still in.
 */
export function Tournament() {
    const tournamentsQuery = useTournaments()
    const playersQuery = usePlayers()
    const matchesQuery = useMatches()
    const tournaments = tournamentsQuery.data ?? []
    const playerMap = createPlayerMap(playersQuery.data ?? [])
    const matches = matchesQuery.data ?? []

    const active = findActiveTournament(tournaments)
    const past = tournaments.filter((tournament) => tournament.endedAt)

    return (
        <QueryState queries={[tournamentsQuery, playersQuery, matchesQuery]}>
            <PageHeader
                title={active ? active.name : 'Turnering'}
                subtitle={
                    active
                        ? `Pågår siden ${formatDate(active.createdAt)}. Kryss av for «Turneringskamp» når du registrerer.`
                        : 'Oppsettet trekkes på forhånd. Her merkes kampene, og taperen er ute.'
                }
                action={
                    active && (
                        <Button as={Link} to="/ny-kamp" variant="primary">
                            Registrer turneringskamp
                        </Button>
                    )
                }
            />

            <div className="flex flex-col gap-40 sm:gap-64">
                {active ? (
                    <ActiveTournament tournament={active} matches={matches} playerMap={playerMap} />
                ) : (
                    <StartTournamentForm />
                )}

                {past.length > 0 && (
                    <section aria-labelledby="tidligere">
                        <SectionHeader id="tidligere" title="Tidligere turneringer" />
                        <ul className="m-0 flex list-none flex-col gap-8 p-0">
                            {past.map((tournament) => (
                                <li key={tournament.id}>
                                    <PastTournament tournament={tournament} matches={matches} playerMap={playerMap} />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </QueryState>
    )
}

interface TournamentViewProps {
    tournament: TournamentType
    matches: Match[]
    playerMap: Map<string, Player>
}

function ActiveTournament({ tournament, matches, playerMap }: TournamentViewProps) {
    const standings = createTournamentStandings(tournament, matches, playerMap)
    // Newest first, like everywhere else.
    const tournamentMatches = resolveMatchPlayers(
        matches.filter((match) => match.tournamentId === tournament.id),
        playerMap
    )

    return (
        <>
            <StatGrid className="sm:grid-cols-3">
                <StatTile label="Kamper spilt" value={tournamentMatches.length} />
                <StatTile label="Fortsatt med" value={standings.remaining.length} hint="Av de som har spilt" />
                <StatTile label="Slått ut" value={standings.eliminated.length} />
            </StatGrid>

            {standings.participants.length > 0 && (
                <div className="grid gap-24 sm:grid-cols-2">
                    <PlayerList title="Fortsatt med" players={standings.remaining} />
                    <PlayerList title="Slått ut" players={standings.eliminated} muted />
                </div>
            )}

            <section aria-labelledby="turneringskamper">
                <SectionHeader id="turneringskamper" title="Kamper" />
                {tournamentMatches.length > 0 ? (
                    <ul className="m-0 flex list-none flex-col gap-8 p-0">
                        {tournamentMatches.map((match) => (
                            <li key={match.id}>
                                <MatchCard match={match} />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-text-subdued">Ingen turneringskamper ennå. Første serve!</p>
                )}
            </section>

            <EndTournament tournament={tournament} />
        </>
    )
}

function PlayerList({ title, players, muted = false }: { title: string; players: Player[]; muted?: boolean }) {
    return (
        <section aria-label={title}>
            <h2 className="small mb-12 font-bold uppercase tracking-wider text-text-subdued">
                {title} · {players.length}
            </h2>
            {players.length > 0 ? (
                <ul className="m-0 flex list-none flex-wrap gap-8 p-0">
                    {players.map((player) => (
                        <li key={player.id}>
                            <Link
                                to="/profil/$id"
                                params={{ id: player.id }}
                                className={`flex items-center gap-8 rounded-full bg-background-container-low py-4 pl-4 pr-12 no-underline hover:underline ${
                                    muted ? 'text-text-subdued line-through' : 'text-text-default'
                                }`}
                            >
                                <PlayerAvatar player={player} />
                                <span className="small">{player.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="small text-text-subdued">Ingen ennå.</p>
            )}
        </section>
    )
}

/**
 * Ending is irreversible from the UI, so it takes two clicks — an inline
 * confirmation rather than window.confirm, which blocks the page.
 */
function EndTournament({ tournament }: { tournament: TournamentType }) {
    const endTournament = useEndTournament()
    const [confirming, setConfirming] = useState(false)

    return (
        <Card variant="outlined" padding="l">
            <div className="flex flex-col gap-16 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="body font-bold">Ferdig med finalen?</p>
                    <p className="small text-text-subdued">
                        Avslutt turneringen for å kåre vinneren. Kampene beholder turneringsmerket.
                    </p>
                </div>
                <div className="flex shrink-0 gap-8">
                    {confirming ? (
                        <>
                            <Button
                                variant="primary"
                                loader={
                                    endTournament.isPending
                                        ? { showLoader: true, textDescription: 'Avslutter...' }
                                        : undefined
                                }
                                onClick={() => endTournament.mutate({ id: tournament.id })}
                            >
                                Ja, avslutt
                            </Button>
                            <Button variant="ghost" onClick={() => setConfirming(false)}>
                                Avbryt
                            </Button>
                        </>
                    ) : (
                        <Button variant="secondary" onClick={() => setConfirming(true)}>
                            Avslutt turnering
                        </Button>
                    )}
                </div>
            </div>
            {endTournament.error && (
                <ErrorMessage className="mt-16" role="alert">
                    {endTournament.error.message}
                </ErrorMessage>
            )}
        </Card>
    )
}

function StartTournamentForm() {
    const startTournament = useStartTournament()
    const [name, setName] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        const parsed = tournamentNameSchema.safeParse(name)
        if (!parsed.success) {
            setError(parsed.error.issues[0]?.message ?? 'Ugyldig navn')
            return
        }
        setError('')
        startTournament.mutate({ name: parsed.data }, { onError: (mutationError) => setError(mutationError.message) })
    }

    return (
        <Card variant="low" padding="l">
            <form onSubmit={handleSubmit} className="flex flex-col gap-16 sm:flex-row sm:items-end">
                <TextInput
                    className="flex-1"
                    width="100%"
                    label="Navn på turneringen"
                    placeholder="F.eks. Høstturnering 2026"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    errorLabel={error || undefined}
                />
                <Button
                    type="submit"
                    variant="primary"
                    loader={startTournament.isPending ? { showLoader: true, textDescription: 'Starter...' } : undefined}
                >
                    Start turnering
                </Button>
            </form>
        </Card>
    )
}

function PastTournament({ tournament, matches, playerMap }: TournamentViewProps) {
    const standings = createTournamentStandings(tournament, matches, playerMap)
    const tournamentMatches = resolveMatchPlayers(
        matches.filter((match) => match.tournamentId === tournament.id),
        playerMap
    )

    return (
        <Card variant="low" padding="m">
            <details>
                <summary className="flex cursor-pointer list-none items-center gap-16">
                    <span className="leading-none text-[1.5rem]" aria-hidden="true">
                        🏆
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                        <span className="body truncate font-bold">{tournament.name}</span>
                        <span className="small text-text-subdued">
                            {formatDate(tournament.createdAt)} – {tournament.endedAt && formatDate(tournament.endedAt)}{' '}
                            · {tournamentMatches.length} kamper
                        </span>
                    </span>
                    {standings.champion && (
                        <span className="flex shrink-0 items-center gap-8">
                            <PlayerAvatar player={standings.champion} />
                            <span className="small font-bold">{standings.champion.name}</span>
                        </span>
                    )}
                </summary>
                <ul className="m-0 mt-16 flex list-none flex-col gap-8 p-0">
                    {tournamentMatches.map((match) => (
                        <li key={match.id}>
                            <MatchCard match={match} />
                        </li>
                    ))}
                </ul>
            </details>
        </Card>
    )
}
