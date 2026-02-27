interface ErrorDetailsProps {
    error: Error
}

export const ErrorDetails = ({ error }: ErrorDetailsProps) => {
    if (import.meta.env.PROD) {
        return null
    }

    return (
        <details className="mt-24 text-left">
            <summary className="text-small cursor-pointer text-text-subdued">
                Tekniske detaljer (kun i utvikling)
            </summary>
            <pre className="text-small mt-8 overflow-auto rounded bg-background-container-high p-12">
                {error.message}
                {error.stack}
            </pre>
        </details>
    )
}
