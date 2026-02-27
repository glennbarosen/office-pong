import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Match, Player } from '../types/pong'
import { getMatches, addMatchWithPlayerUpdates } from '../lib/server/matches'

export function useMatches() {
    return useQuery({
        queryKey: ['matches'],
        queryFn: () => getMatches(),
    })
}

export function useAddMatchWithEloUpdates() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            matchData,
            winnerData,
            loserData,
        }: {
            matchData: Omit<Match, 'id'>
            winnerData: Player
            loserData: Player
        }) => {
            return addMatchWithPlayerUpdates({ data: { matchData, winnerData, loserData } })
        },
        onSuccess: (newMatch) => {
            queryClient.setQueryData(['matches'], (old: Match[] = []) => [newMatch, ...old])
            queryClient.invalidateQueries({ queryKey: ['players'] })
        },
    })
}
