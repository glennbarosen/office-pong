import { Button } from '@fremtind/jokul/button'
import { Icon } from '@fremtind/jokul/icon'
import { useTheme } from '../../hooks/useTheme'

export const Header = () => {
    const { isDark, toggleTheme } = useTheme()

    return (
        <header className="flex items-center justify-between py-8">
            <h1 className="heading-1">Fremtind kontorpong 🏓</h1>
            <Button
                variant="ghost"
                icon={<Icon>{isDark ? 'light_mode' : 'dark_mode'}</Icon>}
                onClick={toggleTheme}
                aria-label="Bytt tema"
            />
        </header>
    )
}
