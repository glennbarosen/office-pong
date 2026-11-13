import { Link } from '@tanstack/react-router'
import { Button } from '@fremtind/jokul/button'
import { Icon } from '@fremtind/jokul/icon'
import { useTheme } from '../../hooks/useTheme'
import { Container } from '../layout/Container'
import { NAV_ITEMS } from './navItems'

/**
 * The sticky app bar: wordmark, primary navigation and the theme toggle.
 *
 * Below `sm` the navigation moves to MobileTabBar at the bottom of the screen,
 * where a thumb reaches it, so the bar keeps only the wordmark and the toggle.
 */
export const Header = () => {
    const { isDark, toggleTheme } = useTheme()

    return (
        <header className="app-header">
            <Container className="flex h-64 items-center gap-24">
                {/* Not a heading: the site name is on every page, and each page
                    owns its own <h1>. */}
                <Link to="/" className="flex items-center gap-12 text-text-default no-underline">
                    <span
                        className="flex h-32 w-32 items-center justify-center rounded-full bg-background-action text-text-on-action"
                        aria-hidden="true"
                    >
                        <Icon variant="small" bold>
                            sports_tennis
                        </Icon>
                    </span>
                    <span className="heading-5 font-bold">Kontorpong</span>
                </Link>

                <nav aria-label="Hovedmeny" className="hidden h-full sm:block">
                    <ul className="m-0 flex h-full list-none gap-4 p-0">
                        {NAV_ITEMS.map((item) => (
                            <li key={item.to}>
                                <Link to={item.to} activeOptions={{ exact: item.exact }} className="app-nav__link">
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="ml-auto flex items-center gap-8">
                    <Button
                        as={Link}
                        to="/ny-kamp"
                        variant="primary"
                        density="compact"
                        className="hidden sm:inline-flex"
                    >
                        Ny kamp
                    </Button>
                    <Button
                        variant="ghost"
                        icon={<Icon>{isDark ? 'light_mode' : 'dark_mode'}</Icon>}
                        onClick={toggleTheme}
                        aria-label={isDark ? 'Bytt til lyst tema' : 'Bytt til mørkt tema'}
                    />
                </div>
            </Container>
        </header>
    )
}
