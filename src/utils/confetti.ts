import confetti from 'canvas-confetti'

/**
 * Extreme celebratory confetti animation for successful match submissions
 * Creates multiple sequential confetti explosions with various colors and patterns
 * 
 * @param onComplete - Callback function to execute after the confetti animation completes
 */
export const triggerMatchSuccessConfetti = (onComplete?: () => void) => {
    // 🎉 EXTREME CELEBRATORY CONFETTI EXPLOSION! 🎉
    const fireConfetti = () => {
        const count = 200
        const defaults = {
            origin: { y: 0.7 },
        }

        function fire(particleRatio: number, opts: Parameters<typeof confetti>[0]) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio),
            })
        }

        // Multiple confetti bursts with different colors and patterns
        fire(0.25, {
            spread: 26,
            startVelocity: 55,
            colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'],
        })

        fire(0.2, {
            spread: 60,
            colors: ['#ff6b35', '#f7931e', '#ffd700', '#32cd32', '#1e90ff'],
        })

        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8,
            colors: ['#ff1493', '#00ced1', '#ffa500', '#9370db', '#32cd32'],
        })

        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2,
            colors: ['#ff4500', '#ff69b4', '#00ff7f', '#1e90ff', '#ffd700'],
        })

        fire(0.1, {
            spread: 120,
            startVelocity: 45,
            colors: ['#dc143c', '#00bfff', '#adff2f', '#ff6347', '#da70d6'],
        })
    }

    // First explosion
    fireConfetti()

    // Second explosion from left
    setTimeout(() => {
        confetti({
            particleCount: 150,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.8 },
            colors: ['#ff0080', '#00ff80', '#8000ff', '#ff8000', '#0080ff'],
        })
    }, 200)

    // Third explosion from right
    setTimeout(() => {
        confetti({
            particleCount: 150,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.8 },
            colors: ['#ff4080', '#80ff40', '#4080ff', '#ff8040', '#8040ff'],
        })
    }, 400)

    // Final center explosion
    setTimeout(() => {
        confetti({
            particleCount: 300,
            spread: 360,
            origin: { x: 0.5, y: 0.5 },
            startVelocity: 40,
            ticks: 100,
            colors: [
                '#ff1744',
                '#e91e63',
                '#9c27b0',
                '#673ab7',
                '#3f51b5',
                '#2196f3',
                '#03a9f4',
                '#00bcd4',
                '#009688',
                '#4caf50',
                '#8bc34a',
                '#cddc39',
                '#ffeb3b',
                '#ffc107',
                '#ff9800',
                '#ff5722',
            ],
        })
    }, 600)

    // Even more confetti rain
    setTimeout(() => {
        const duration = 2000
        const animationEnd = Date.now() + duration
        const colors = [
            '#ff0044',
            '#44ff00',
            '#0044ff',
            '#ff4400',
            '#4400ff',
            '#00ff44',
            '#ffff00',
            '#ff00ff',
            '#00ffff',
        ]

        const randomInRange = (min: number, max: number) => {
            return Math.random() * (max - min) + min
        }

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now()

            if (timeLeft <= 0) {
                clearInterval(interval)
                return
            }

            const particleCount = 50 * (timeLeft / duration)

            confetti({
                particleCount,
                startVelocity: randomInRange(50, 100),
                spread: randomInRange(50, 100),
                origin: {
                    x: Math.random(),
                    y: Math.random() - 0.2,
                },
                colors: colors,
            })
        }, 250)
    }, 800)

    // Execute callback after the extreme celebration
    if (onComplete) {
        setTimeout(() => {
            onComplete()
        }, 3500)
    }
}

/**
 * Simple confetti burst for smaller celebrations
 */
export const triggerSimpleConfetti = () => {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    })
}

/**
 * Confetti cannon effect from a specific origin
 */
export const triggerConfettiCannon = (origin: { x: number; y: number }) => {
    confetti({
        particleCount: 150,
        angle: 90,
        spread: 45,
        origin,
        startVelocity: 50,
        colors: ['#ff6b35', '#f7931e', '#ffd700', '#32cd32', '#1e90ff']
    })
}
