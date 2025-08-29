import { WarningTag, Tag, SuccessTag } from '@fremtind/jokul'
import type { SystemMessageDto } from '../../types'

type Props = Pick<SystemMessageDto, 'isActive' | 'isDisabled' | 'publishFrom'>

export const MessageStatusTag = ({ isActive, isDisabled, publishFrom }: Props) => {
    const now = Date.now()
    const publishFromTime = publishFrom ? new Date(publishFrom).getTime() : 0
    if (isActive && isDisabled) return <Tag>Deaktivert</Tag>
    if (isActive && !isDisabled) return <SuccessTag>Aktiv</SuccessTag>
    if (publishFromTime > now) return <Tag>Planlagt</Tag>
    if (!isActive) return <WarningTag>Inaktiv</WarningTag>
    return <Tag>Status ukjent</Tag>
}
