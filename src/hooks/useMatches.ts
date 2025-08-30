import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Match, Player } from '../types/pong'
import { DataService } from '../lib/dataService'

export function useMatches() {
    return useQuery({
        queryKey: ['matches'],
        queryFn: DataService.getMatches,
    })
}

export function useAddMatch() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: DataService.addMatch,
        onSuccess: (newMatch) => {
            queryClient.setQueryData(['matches'], (old: Match[] = []) => [newMatch, ...old])
            queryClient.invalidateQueries({ queryKey: ['players'] })
        },
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
            return DataService.addMatchWithPlayerUpdates(matchData, winnerData, loserData)
        },
        onSuccess: (newMatch) => {
            queryClient.setQueryData(['matches'], (old: Match[] = []) => [newMatch, ...old])
            queryClient.invalidateQueries({ queryKey: ['players'] })
        },
    })
}
