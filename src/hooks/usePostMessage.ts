import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getMessagesWithFiltersQueryKey, postMessageMutation } from '../types/@tanstack/react-query.gen'

export const usePostMessage = () => {
    const queryClient = useQueryClient()
    return useMutation({
        ...postMessageMutation(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getMessagesWithFiltersQueryKey() })
        },
    })
}
