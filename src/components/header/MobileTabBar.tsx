import { Link } from '@tanstack/react-router'
import { Icon } from '@fremtind/jokul/icon'
import { NAV_ITEMS } from './navItems'

const [overview, leaderboard, matches, tournament] = NAV_ITEMS

/**
 * Bottom navigation for phones: the four destinations plus "Ny kamp" in the
 * middle, since registering a match at the table is the app's main job.
 * Hidden from `sm` up, where the header carries the same links.
 */
export function MobileTabBar() {
    return (
        <nav aria-label="Hovedmeny" className="app-tabbar sm:hidden">
            <ul className="m-0 flex list-none items-stretch p-0">
                <TabItem {...overview} />
                <TabItem {...leaderboard} />
                <li className="flex flex-1">
                    <Link to="/ny-kamp" className="app-tabbar__link">
                        <span className="app-tabbar__action">
                            <Icon bold aria-hidden="true">
                                add
                            </Icon>
                        </span>
                        <span className="sr-only">Ny kamp</span>
                    </Link>
                </li>
                <TabItem {...matches} />
                <TabItem {...tournament} />
            </ul>
        </nav>
    )
}

function TabItem({ to, label, icon, exact }: (typeof NAV_ITEMS)[number]) {
    return (
        <li className="flex flex-1">
            <Link to={to} activeOptions={{ exact }} className="app-tabbar__link">
                <Icon aria-hidden="true">{icon}</Icon>
                {label}
            </Link>
        </li>
    )
}
