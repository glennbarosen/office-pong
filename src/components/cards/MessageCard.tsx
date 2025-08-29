import { Card, Tag, DescriptionList, DescriptionTerm, DescriptionDetail } from '@fremtind/jokul'
import { type SystemMessageDto } from '../../types'
import { MessageSettingsMenu } from '../MessageSettingsMenu'
import { MessageTypeTag } from '../tags/MessageTypeTag'
import { formatClients, formatDate } from '../../utils/formatters'

interface Props {
    message: SystemMessageDto
}

export const MessageCard = ({ message }: Props) => {
    const isFutureMessage = new Date(message.publishFrom).getTime() > new Date().getTime()
    const showSettings = message.isActive || isFutureMessage
    return (
        <Card className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3" key={message.id}>
            <div className="flex justify-end gap-4">
                {message.isDismissible && <Tag>Fjernbar</Tag>}
                <MessageTypeTag messageType={message.type} />
            </div>
            <h3 className="heading-2 truncate" title={message.message}>
                {message.message}
            </h3>
            <DescriptionList>
                <DescriptionTerm>Aktiv fra</DescriptionTerm>
                <DescriptionDetail>{formatDate(message.publishFrom)}</DescriptionDetail>
                <DescriptionTerm>Aktiv til</DescriptionTerm>
                <DescriptionDetail>{formatDate(message.publishTo)}</DescriptionDetail>
                <DescriptionTerm>&nbsp;</DescriptionTerm>
                <DescriptionDetail>&nbsp;</DescriptionDetail>
                <DescriptionTerm>Opprettet</DescriptionTerm>
                <DescriptionDetail>{formatDate(message.createdAt)}</DescriptionDetail>
                <DescriptionTerm>Opprettet av</DescriptionTerm>
                <DescriptionDetail>{message.createdBy}</DescriptionDetail>
                <DescriptionTerm>Klienter</DescriptionTerm>
                <DescriptionDetail>{formatClients(message.clients)}</DescriptionDetail>
                <DescriptionTerm>Type</DescriptionTerm>
                <DescriptionDetail>{message.title ? 'Pop-up' : 'Banner'}</DescriptionDetail>
            </DescriptionList>
            {showSettings && <MessageSettingsMenu id={message.id} isDisabled={message.isDisabled} />}
        </Card>
    )
}
