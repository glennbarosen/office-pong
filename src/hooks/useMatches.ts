import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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

export function useAddMatch() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (matchData: Omit<Match, 'id'>) => {
            // Simulate API call - in a real app this would save to backend
            const newMatch: Match = {
                ...matchData,
                id: `match-${Date.now()}`,
            }

            // Simulate network delay
            await new Promise((resolve) => setTimeout(resolve, 500))

            return newMatch
        },
        onSuccess: (newMatch) => {
            queryClient.setQueryData(['matches'], (old: Match[] = []) => [...old, newMatch])
            queryClient.invalidateQueries({ queryKey: ['players'] })
        },
    })
}
