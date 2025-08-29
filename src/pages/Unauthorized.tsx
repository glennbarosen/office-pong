import { useNavigate } from '@tanstack/react-router'
import { Button } from '@fremtind/jokul'

export function Unauthorized() {
    const navigate = useNavigate()

    return (
        <section className="pt-104">
            <h1 className="title">Du har ikke tilgang</h1>
            <p className="body">
                Du har ikke tilgang til denne applikasjonen. Dette kan skyldes at du ikke er logget inn, eller at du
                mangler nødvendige tillatelser.
            </p>
            <p className="body">Kontakt din administrator for å få tilgang, eller prøv å logge inn på nytt.</p>

            <div className="mt-24 space-y-4">
                <div className="flex gap-12">
                    <Button variant="secondary" onClick={() => window.location.reload()}>
                        Prøv igjen
                    </Button>
                    <Button variant="primary" onClick={() => navigate({ to: '/' })}>
                        Gå til forsiden
                    </Button>
                </div>
            </div>
        </section>
    )
}
