import { useMutation, useQueryClient } from '@tanstack/react-query'
import { disableMessageMutation, getMessagesWithFiltersQueryKey } from '../types/@tanstack/react-query.gen'

export const useDisableMessage = () => {
    const queryClient = useQueryClient()

    return useMutation({
        ...disableMessageMutation(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getMessagesWithFiltersQueryKey() })
        },
    })
}
