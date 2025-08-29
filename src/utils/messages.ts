import type { SystemMessageDto } from '../types'

export const activeMessageFilter = (message: SystemMessageDto) => message.isActive && !message.isDisabled

export const disabledMessageFilter = (message: SystemMessageDto) => message.isActive && message.isDisabled

export const futureMessageFilter = (message: SystemMessageDto) => {
    const publishFrom = new Date(message.publishFrom).getTime()
    return publishFrom > new Date().getTime() && !message.isDisabled
}

export const inactiveMessageFilter = (message: SystemMessageDto) => !message.isActive

export const sortByCreatedAt = (a: SystemMessageDto, b: SystemMessageDto) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return bTime - aTime
}
export const sortByPublishFrom = (a: SystemMessageDto, b: SystemMessageDto) => {
    const aTime = new Date(a.publishFrom).getTime()
    const bTime = new Date(b.publishFrom).getTime()
    return aTime - bTime
}

export const sortByPublishToDesc = (a: SystemMessageDto, b: SystemMessageDto) => {
    const aTime = new Date(a.publishTo).getTime()
    const bTime = new Date(b.publishTo).getTime()
    return bTime - aTime
}
