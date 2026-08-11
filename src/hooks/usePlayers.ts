import { queryOptions, useQuery } from '@tanstack/react-query'
import { getPlayers } from '../lib/server/players'
import { queryKeys } from '../lib/queryKeys'

/**
 * Shared by the hook and by the route loaders, so a loader can never prefetch
 * under a different key or with different options than the component reads.
 */
export const playersQueryOptions = queryOptions({
    queryKey: queryKeys.players,
    queryFn: getPlayers,
})

export function usePlayers() {
    return useQuery(playersQueryOptions)
}
