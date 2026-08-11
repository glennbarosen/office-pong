import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Match } from '../types/pong'
import type { CreateMatchInput } from '../lib/validation'
import { getMatches, createMatch } from '../lib/server/matches'
import { queryKeys } from '../lib/queryKeys'

export function useMatches() {
    return useQuery({
        queryKey: queryKeys.matches,
        queryFn: getMatches,
    })
}

export function useCreateMatch() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: CreateMatchInput) => createMatch({ data: input }),
        // Seeding the list with the server's own row (not an optimistic guess —
        // the server computes elo_changes, so a fabricated entry would be wrong)
        // makes /kamper correct immediately, before the refetch lands.
        onSuccess: (newMatch) => {
            queryClient.setQueryData(queryKeys.matches, (old: Match[] = []) => [newMatch, ...old])
        },
        // onSettled, not onSuccess: a failed write may still have altered state,
        // and both lists derive from the match that was just registered.
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.matches })
            void queryClient.invalidateQueries({ queryKey: queryKeys.players })
        },
    })
}
