import { PopupTip } from '@fremtind/jokul'
import type { SystemMessageDto } from '../../types'
import { MessageCard } from './MessageCard'

interface Props {
    title: string
    messages?: SystemMessageDto[]
    description?: string
}

export const CardList = ({ title, description, messages }: Props) => {
    return (
        <>
            <div>
                <h2 className="heading-2">
                    {title}
                    {description && (
                        <span className="body ml-4">
                            <PopupTip content={description} />
                        </span>
                    )}
                </h2>
                {!messages?.length ? (
                    <p className="text-text-subdued">Ingen meldinger</p>
                ) : (
                    <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
                        {messages.map((message) => (
                            <MessageCard key={message.id} message={message} />
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}
