import { Button } from '@fremtind/jokul/button'
import { Icon } from '@fremtind/jokul/icon'
import { useTheme } from '../../hooks/useTheme'

export const Header = () => {
    const { isDark, toggleTheme } = useTheme()

    return (
        <header className="flex items-center justify-between py-8">
            {/* Styled as a heading but not one: this is the site name, shown
                on every page, so making it <h1> gave pages with a real title
                two of them. Each page owns its own <h1>. */}
            <p className="heading-1">
                Fremtind kontorpong <span aria-hidden="true">🏓</span>
            </p>
            <Button
                variant="ghost"
                icon={<Icon>{isDark ? 'light_mode' : 'dark_mode'}</Icon>}
                onClick={toggleTheme}
                aria-label="Bytt tema"
            />
        </header>
    )
}
