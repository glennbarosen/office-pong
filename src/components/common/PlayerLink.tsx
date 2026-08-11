import { Link } from '@fremtind/jokul/link'
import { Link as RouterLink } from '@tanstack/react-router'

interface PlayerLinkProps {
    playerId: string
    playerName: string
}

export function PlayerLink({ playerId, playerName }: PlayerLinkProps) {
    return (
        <Link
            className="underline"
            as={RouterLink}
            to="/profil/$id"
            // @ts-expect-error - Router typing issue with params
            params={{ id: playerId }}
        >
            {playerName}
        </Link>
    )
}
