import { useQuery } from '@tanstack/react-query'
import { getMessageByIdOptions } from '../types/@tanstack/react-query.gen'
import { MessageForm } from '../components/message-form/MessageForm'

interface EditMessageProps {
    id: string
}

export function EditMessage({ id }: EditMessageProps) {
    const { data: message, isPending } = useQuery({ ...getMessageByIdOptions({ path: { id } }) })

    if (isPending)
        return (
            <div className="py-64 text-center">
                <p className="text-text-subdued">Laster melding...</p>
            </div>
        )

    return message ? <MessageForm existingMessage={message} /> : null
}
