import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteMessageMutation, getMessagesWithFiltersQueryKey } from '../types/@tanstack/react-query.gen'

export const useDeleteMessage = () => {
    const queryClient = useQueryClient()

    return useMutation({
        ...deleteMessageMutation(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getMessagesWithFiltersQueryKey() })
        },
    })
}
