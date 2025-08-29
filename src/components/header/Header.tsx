import { HeaderLink } from '../links/HeaderLink'

export const Header = () => (
    <header className="py-4">
        <nav className="flex flex-grow items-center justify-between">
            <ol className="flex gap-24">
                <li>
                    <HeaderLink to="/">Rangliste</HeaderLink>
                </li>
            </ol>
        </nav>
    </header>
)
