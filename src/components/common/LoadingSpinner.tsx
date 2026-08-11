interface LoadingSpinnerProps {
    message?: string
    className?: string
}

/**
 * role="status" + aria-live="polite" so the change is announced rather than
 * being a silent swap for a screen-reader user. Polite, not assertive: a page
 * loading should not interrupt whatever is being read.
 */
export function LoadingSpinner({ message = 'Laster...', className = 'min-h-64' }: LoadingSpinnerProps) {
    return (
        <div role="status" aria-live="polite" className={`flex items-center justify-center ${className}`}>
            <div>{message}</div>
        </div>
    )
}
