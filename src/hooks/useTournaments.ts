import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { endTournament, getTournaments, startTournament } from '../lib/server/tournaments'
import type { EndTournamentInput, StartTournamentInput } from '../lib/validation'
import { queryKeys } from '../lib/queryKeys'

/** Shared by the hook and by the route loaders, like the other query options. */
export const tournamentsQueryOptions = queryOptions({
    queryKey: queryKeys.tournaments,
    queryFn: getTournaments,
})

export function useTournaments() {
    return useQuery(tournamentsQueryOptions)
}

export function useStartTournament() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: StartTournamentInput) => startTournament({ data: input }),
        onSettled: () => void queryClient.invalidateQueries({ queryKey: queryKeys.tournaments }),
    })
}

export function useEndTournament() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: EndTournamentInput) => endTournament({ data: input }),
        onSettled: () => void queryClient.invalidateQueries({ queryKey: queryKeys.tournaments }),
    })
}
