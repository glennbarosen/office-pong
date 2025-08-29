import { Link, useLocation } from '@tanstack/react-router'
import { Icon } from '@fremtind/jokul'

export const BottomNavigation = () => {
    const location = useLocation()

    const navItems = [
        {
            to: '/',
            icon: 'leaderboard',
            label: 'Rangliste',
            isActive: location.pathname === '/',
        },
        {
            to: '/ny-kamp',
            icon: 'add_circle',
            label: 'Ny kamp',
            isActive: location.pathname === '/ny-kamp',
        },
    ]

    return (
        <nav className="bg-white border-gray-200 fixed bottom-0 left-0 right-0 z-10 border-t px-4 py-2">
            <div className="mx-auto flex max-w-md justify-around">
                {navItems.map((item) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={`flex flex-col items-center rounded-lg px-4 py-2 transition-colors ${
                            item.isActive
                                ? 'text-blue-600 bg-blue-50'
                                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                    >
                        <Icon className="mb-1">{item.icon}</Icon>
                        <span className="text-xs font-medium">{item.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    )
}
