import { Button, ChevronDownIcon, MenuItemCheckbox, Popover } from '@fremtind/jokul'
import { useRouteContext } from '@tanstack/react-router'
import { useState } from 'react'
import { useTheme } from '../../hooks/useTheme'

export const UserMenu = () => {
    const { isDark, toggleTheme } = useTheme()
    const [open, setOpen] = useState(false)
    const { user } = useRouteContext({ strict: false })

    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
            roleOptions={{
                role: 'menu',
            }}
            placement="bottom-end"
        >
            <Popover.Trigger
                onClick={() => {
                    setOpen(!open)
                }}
                aria-expanded={open}
                asChild
            >
                <Button variant="ghost" icon={<ChevronDownIcon />} iconPosition="right">
                    {user?.name}
                </Button>
            </Popover.Trigger>
            <Popover.Content>
                <div className="min-w-[300px] bg-background-container-high">
                    <MenuItemCheckbox aria-checked={isDark} onChange={toggleTheme}>
                        Mørkt tema
                    </MenuItemCheckbox>
                </div>
            </Popover.Content>
        </Popover>
    )
}
