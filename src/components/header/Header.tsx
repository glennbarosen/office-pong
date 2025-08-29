import { HeaderLink } from '../links/HeaderLink'
import { UserMenu } from './UserMenu'

export const Header = () => (
    <header className="py-4">
        <nav className="flex flex-grow items-center justify-between">
            <ol className="flex gap-24">
                <li>
                    <HeaderLink to="/">Oversikt</HeaderLink>
                </li>
                <li>
                    <HeaderLink to="/arkiv">Arkiv</HeaderLink>
                </li>
            </ol>
            <div>
                <UserMenu />
            </div>
        </nav>
    </header>
)
