import { useForm } from 'react-hook-form'
import { addDays } from 'date-fns'
import { usePostMessage } from './usePostMessage'
import { useEditMessage } from './useEditMessage'
import type { SystemMessageDto } from '../types'
import type { MessageFormData } from '../components/message-form/types'
import { useRouteContext } from '@tanstack/react-router'

interface UseSystemMessageFormProps {
    existingMessage?: MessageFormData
    onSuccess?: () => void
    onError?: (error: Error) => void
}

export const useMessageForm = ({ existingMessage, onSuccess, onError }: UseSystemMessageFormProps = {}) => {
    const { mutate: editMessage, isPending: isEditing, error: editError } = useEditMessage()
    const { mutate: postMessage, isPending: isCreating, error: createError } = usePostMessage()
    const { user } = useRouteContext({ strict: false })

    const initialValues: MessageFormData = existingMessage
        ? existingMessage
        : {
              message: '',
              createdBy: user?.name ? user.name : undefined,
              publishFrom: new Date().toString(),
              publishTo: addDays(new Date(), 1).toString(),
              type: 'ERROR',
              isDismissible: true,
              isDisabled: false,
              isActive: false,
              variant: 'BANNER',
          }

    const form = useForm<MessageFormData>({ defaultValues: initialValues })

    const isSubmitting = isEditing || isCreating
    const submitError = editError || createError

    const onSubmit = (data: MessageFormData) => {
        try {
            if (existingMessage?.id) {
                editMessage(
                    { path: { id: existingMessage.id }, body: data as SystemMessageDto },
                    {
                        onSuccess: () => onSuccess?.(),
                        onError: (error: unknown) => onError?.(error as Error),
                    }
                )
            } else {
                postMessage(
                    { body: data as SystemMessageDto },
                    {
                        onSuccess: () => onSuccess?.(),
                        onError: (error: unknown) => onError?.(error as Error),
                    }
                )
            }
        } catch (error) {
            onError?.(error as Error)
        }
    }

    return {
        form,
        onSubmit,
        isSubmitting,
        submitError,
        isEditing: !!existingMessage,
    }
}
