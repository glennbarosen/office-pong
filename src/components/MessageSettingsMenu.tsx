import { Button, DotsIcon, Icon, Menu, MenuItem, PenIcon, TrashCanIcon } from '@fremtind/jokul'
import { useCallback } from 'react'
import { useDeleteMessage } from '../hooks/useDeleteMessage'
import { useNavigate } from '@tanstack/react-router'
import { useDisableMessage } from '../hooks/useDisableMessage'
import { useEnableMessage } from '../hooks/useEnableMessage'
import type { SystemMessageDto } from '../types'

type Props = Pick<SystemMessageDto, 'id' | 'isDisabled'>

export const MessageSettingsMenu = ({ id = '', isDisabled }: Props) => {
    const navigate = useNavigate()
    const { mutate: deleteMessage } = useDeleteMessage()
    const { mutate: disableMessage } = useDisableMessage()
    const { mutate: enableMessage } = useEnableMessage()

    const handleEdit = useCallback(() => {
        navigate({ to: '/endre/$id', params: { id } })
    }, [id, navigate])

    const handleDelete = useCallback(() => {
        deleteMessage({ path: { id } })
    }, [deleteMessage, id])

    const handleToggleDisabled = useCallback(() => {
        if (isDisabled) return enableMessage({ path: { id } })
        return disableMessage({ path: { id } })
    }, [disableMessage, enableMessage, isDisabled, id])

    if (!id) return null
    return (
        <div data-density="compact" className="flex items-center justify-end">
            <Menu triggerElement={<Button title="Meldingsinnstillinger" variant="ghost" icon={<DotsIcon />} />}>
                <MenuItem icon={<PenIcon />} onClick={handleEdit}>
                    Endre
                </MenuItem>
                <MenuItem
                    icon={<Icon>{isDisabled ? 'visibility' : 'visibility_off'}</Icon>}
                    onClick={handleToggleDisabled}
                >
                    {isDisabled ? 'Aktiver' : 'Deaktiver'}
                </MenuItem>
                <MenuItem icon={<TrashCanIcon />} onClick={handleDelete}>
                    Slett
                </MenuItem>
            </Menu>
        </div>
    )
}
