import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getMessagesWithFiltersQueryKey, updateMessageMutation } from '../types/@tanstack/react-query.gen'

export const useEditMessage = () => {
    const queryClient = useQueryClient()
    return useMutation({
        ...updateMessageMutation(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getMessagesWithFiltersQueryKey() })
        },
    })
}
