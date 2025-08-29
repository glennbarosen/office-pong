import { useQuery } from '@tanstack/react-query'
import type { Match } from '../types/pong'
import dbData from '../data/db.json'

export function useMatches() {
    return useQuery({
        queryKey: ['matches'],
        queryFn: (): Promise<Match[]> => {
            // Simulate API call with local JSON data
            return Promise.resolve(dbData.matches as unknown as Match[])
        },
    })
}
