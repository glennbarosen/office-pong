import { format, isValid } from 'date-fns'
import type { SystemMessageDto } from '../types'
import { CLIENTS, DIST_GROUPS } from './constants'

export const formatDate = (dateString?: string): string => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    if (!isValid(date)) return '-'
    return format(date, 'dd.MM.yyyy HH:mm')
}

export const formatClients = (clients: SystemMessageDto['clients']): string => {
    if (!clients || clients.length === 0) return '-'
    return clients
        .map((client) => {
            const clientOption = CLIENTS.find((c) => c.value === client)
            return clientOption?.label || client
        })
        .join(', ')
}
export const formatDistGroups = (distGroups: SystemMessageDto['distGroups']): string => {
    if (!distGroups || distGroups.length === 0) return '-'
    return distGroups
        .map((distGroup) => {
            const distGroupOption = DIST_GROUPS.find((dg) => dg.value === distGroup)
            return distGroupOption?.label || distGroup
        })
        .join(', ')
}
