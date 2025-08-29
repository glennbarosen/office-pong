import { Button } from '@fremtind/jokul'
import { Container } from '../layout/Container'
import { ErrorDetails } from './ErrorDetails'

interface RootErrorComponentProps {
    error: Error
}

export const RootErrorComponent = ({ error }: RootErrorComponentProps) => {
    return (
        <Container>
            <div className="py-168">
                <h1 className="heading-1 mb-16">Noe gikk galt</h1>
                <p className="mb-24 text-text-subdued">Det oppstod en uventet feil. Prøv å laste siden på nytt.</p>
                <Button variant="primary" onClick={() => window.location.reload()}>
                    Last siden på nytt
                </Button>
                <ErrorDetails error={error} />
            </div>
        </Container>
    )
}
