import { ErrorMessage } from '@fremtind/jokul'

interface FormErrorProps {
    error?: Error | unknown | null
    className?: string
}

export const FormError = ({ error, className }: FormErrorProps) => {
    if (!error) return null

    const errorMessage =
        error instanceof Error
            ? error.message
            : typeof error === 'string'
              ? error
              : 'Det oppstod en feil. Prøv igjen senere.'

    return (
        <div className={className}>
            <ErrorMessage>{errorMessage}</ErrorMessage>
        </div>
    )
}
