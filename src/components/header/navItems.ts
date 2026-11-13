/** The primary destinations, shared by the header nav and the mobile tab bar. */
export const NAV_ITEMS = [
    { to: '/', label: 'Oversikt', icon: 'home', exact: true },
    { to: '/ledertavle', label: 'Ledertavle', icon: 'leaderboard', exact: false },
    { to: '/kamper', label: 'Kamper', icon: 'sports_tennis', exact: false },
    { to: '/turnering', label: 'Turnering', icon: 'emoji_events', exact: false },
] as const
