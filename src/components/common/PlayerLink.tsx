import { Button } from '@fremtind/jokul/button'
import { Link } from '@tanstack/react-router'

interface PlayerLinkProps {
    playerId: string
    playerName: string
    className?: string
    variant?: 'ghost' | 'primary' | 'secondary' | 'tertiary'
}

export function PlayerLink({ playerId, playerName, className = 'font-medium p-0', variant = 'ghost' }: PlayerLinkProps) {
    return (
        <Button
            as={Link}
            to="/profil/$id"
            // @ts-expect-error - Router typing issue with params
            params={{ id: playerId }}
            variant={variant}
            className={className}
        >
            {playerName}
        </Button>
    )
}
