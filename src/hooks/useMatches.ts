import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Match } from '../types/pong'
import type { CreateMatchInput } from '../lib/validation'
import { getMatches, createMatch } from '../lib/server/matches'

export function useMatches() {
    return useQuery({
        queryKey: ['matches'],
        queryFn: () => getMatches(),
    })
}

export function useCreateMatch() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: CreateMatchInput) => createMatch({ data: input }),
        onSuccess: (newMatch) => {
            queryClient.setQueryData(['matches'], (old: Match[] = []) => [newMatch, ...old])
            // A match always changes two ratings, and may have created players.
            void queryClient.invalidateQueries({ queryKey: ['players'] })
        },
    })
}
