import { useNavigate, useRouter } from '@tanstack/react-router'
import { useCallback } from 'react'

export const useFormNavigation = () => {
    const navigate = useNavigate()
    const router = useRouter()

    const handleGoBack = useCallback(() => {
        router.history.back()
    }, [router.history])

    const navigateToHome = useCallback(() => {
        navigate({ to: '/' })
    }, [navigate])

    const navigateToEdit = useCallback(
        (id: string) => {
            navigate({ to: `/endre/${id}` })
        },
        [navigate]
    )

    return {
        handleGoBack,
        navigateToHome,
        navigateToEdit,
    }
}
