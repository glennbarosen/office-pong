import { useState, useEffect } from 'react'
import { MOBILE_BREAKPOINT } from '../constants/layout'

/**
 * Whether the viewport is phone-sized.
 *
 * Starts false so the server and the first client render agree; the effect
 * corrects it before paint.
 */
export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const query = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
        const update = () => setIsMobile(query.matches)

        update()
        query.addEventListener('change', update)

        return () => query.removeEventListener('change', update)
    }, [])

    return isMobile
}
