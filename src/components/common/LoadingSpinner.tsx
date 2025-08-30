interface LoadingSpinnerProps {
    message?: string
    className?: string
}

export function LoadingSpinner({ message = 'Laster...', className = 'min-h-64' }: LoadingSpinnerProps) {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div>{message}</div>
        </div>
    )
}
