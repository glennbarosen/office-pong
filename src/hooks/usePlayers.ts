import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Player } from '../types/pong'
import { DataService } from '../lib/dataService'

export function usePlayers() {
    return useQuery({
        queryKey: ['players'],
        queryFn: DataService.getPlayers,
    })
}

export function useAddPlayer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: DataService.addPlayer,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['players'] })
        },
    })
}

export function useUpdatePlayer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Player> & { id: string }) => {
            return DataService.updatePlayer(id, updates)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['players'] })
        },
    })
}
