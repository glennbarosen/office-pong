import { useQuery } from '@tanstack/react-query'
import { getPlayers } from '../lib/server/players'
import { queryKeys } from '../lib/queryKeys'

export function usePlayers() {
    return useQuery({
        queryKey: queryKeys.players,
        queryFn: getPlayers,
    })
}
