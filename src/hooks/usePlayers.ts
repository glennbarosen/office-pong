import { useQuery } from '@tanstack/react-query'
import type { Player } from '../types/pong'
import dbData from '../data/db.json'

export function usePlayers() {
    return useQuery({
        queryKey: ['players'],
        queryFn: (): Promise<Player[]> => {
            // Simulate API call with local JSON data
            return Promise.resolve(dbData.players)
        },
    })
}
