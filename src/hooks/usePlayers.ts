import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Player } from '../types/pong'
import { getPlayers, addPlayer, updatePlayer } from '../lib/server/players'

export function usePlayers() {
    return useQuery({
        queryKey: ['players'],
        queryFn: () => getPlayers(),
    })
}

export function useAddPlayer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (playerData: Omit<Player, 'id'>) => addPlayer({ data: playerData }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['players'] })
        },
    })
}

export function useUpdatePlayer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Player> & { id: string }) => {
            return updatePlayer({ data: { id, updates } })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['players'] })
        },
    })
}
