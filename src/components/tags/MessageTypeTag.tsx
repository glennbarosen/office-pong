import { ErrorTag, WarningTag, InfoTag } from '@fremtind/jokul'
import type { SystemMessageDto } from '../../types'

interface Props {
    messageType: SystemMessageDto['type']
}

export const MessageTypeTag = ({ messageType }: Props) => {
    switch (messageType) {
        case 'ERROR':
            return <ErrorTag>Feil</ErrorTag>
        case 'WARNING':
            return <WarningTag>Advarsel</WarningTag>
        case 'INFO':
        default:
            return <InfoTag>Informasjon</InfoTag>
    }
}
