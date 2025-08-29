import type { LinkComponentProps } from '@tanstack/react-router'
import { JokulRouterLink } from './JokulRouterLink'
import './header-link.scss'

type Props = LinkComponentProps<typeof JokulRouterLink>

export const HeaderLink = ({ children, activeProps, inactiveProps, ...rest }: Props) => {
    return (
        <JokulRouterLink
            inactiveProps={{
                className: 'rk-header-link',
                ...(typeof inactiveProps === 'function' ? inactiveProps() : inactiveProps),
            }}
            activeProps={{
                className: 'rk-header-link rk-header-link--active',
                ...(typeof activeProps === 'function' ? activeProps() : activeProps),
            }}
            {...rest}
        >
            {children}
        </JokulRouterLink>
    )
}
