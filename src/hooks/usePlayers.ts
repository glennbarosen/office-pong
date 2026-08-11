import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Player } from '../types/pong'
import { getPlayers, addPlayer } from '../lib/server/players'

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
            void queryClient.invalidateQueries({ queryKey: ['players'] })
        },
    })
}
