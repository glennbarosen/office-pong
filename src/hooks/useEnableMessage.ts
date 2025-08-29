import { useMutation, useQueryClient } from '@tanstack/react-query'
import { enableMessageMutation, getMessagesWithFiltersQueryKey } from '../types/@tanstack/react-query.gen'

export const useEnableMessage = () => {
    const queryClient = useQueryClient()

    return useMutation({
        ...enableMessageMutation(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getMessagesWithFiltersQueryKey() })
        },
    })
}
