import { useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'
import { Button, Icon } from '@fremtind/jokul'
import { CardList } from '../components/cards/CardList'
import { useMessages } from '../hooks/useMessages'
import {
    activeMessageFilter,
    disabledMessageFilter,
    futureMessageFilter,
    inactiveMessageFilter,
    sortByCreatedAt,
    sortByPublishToDesc,
    sortByPublishFrom,
} from '../utils/messages'

export function Overview() {
    const navigate = useNavigate()
    const { data: messages, isLoading } = useMessages()

    const activeMessages = useMemo(() => messages?.filter(activeMessageFilter).sort(sortByCreatedAt), [messages])

    const futureMessages = useMemo(() => messages?.filter(futureMessageFilter).sort(sortByPublishFrom), [messages])

    const disabledMessages = useMemo(() => messages?.filter(disabledMessageFilter).sort(sortByCreatedAt), [messages])

    const recentInactiveMessages = useMemo(
        () =>
            messages
                ?.filter((message) => inactiveMessageFilter(message) && !futureMessageFilter(message))
                ?.slice(0, 6)
                .sort(sortByPublishToDesc),
        [messages]
    )

    return (
        <section>
            <h1 className="title-small">Driftsmeldinger</h1>
            <div className="flex justify-end">
                <Button variant="primary" icon={<Icon>add</Icon>} onClick={() => navigate({ to: '/opprett' })}>
                    Opprett melding
                </Button>
            </div>

            {isLoading ? (
                <div className="py-64 text-center">
                    <p className="text-text-subdued">Laster meldinger...</p>
                </div>
            ) : (
                <div className="space-y-40">
                    <CardList title="Aktive meldinger" messages={activeMessages} />
                    <CardList title="Planlagte meldinger" messages={futureMessages} />
                    <CardList
                        title="Deaktiverte meldinger"
                        description="Driftsmeldinger som er innenfor det aktive vinduet, men som ikke vises fordi en administrator har dekativert den manuelt."
                        messages={disabledMessages}
                    />
                    <CardList
                        title="Siste inaktive meldinger"
                        description="Viser de 6 siste inaktive driftsmeldingene. Bruk arkivsiden for å se alle tidligere meldinger."
                        messages={recentInactiveMessages}
                    />
                </div>
            )}
        </section>
    )
}
