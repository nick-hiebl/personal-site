import { useEffect, useState } from 'react'

import { useGameContext } from '../context'

import './StatusMenu.css'

export const StatusMenu = () => {
    const { output, settings } = useGameContext()

    if (output.state.state === 'pending') {
        return (
            <div id="status-menu">
                Waiting for everyone to join and ready up
            </div>
        )
    } else if (output.state.state === 'giving-clues') {
        const guesserId = output.state.guesserId

        const guesser = output.players.find(player => player.id === guesserId)

        if (guesserId === output.yourId) {
            return (
                <div id="status-menu">
                    Waiting for others to give YOU clues {settings?.cluesTimerEnabled && <Timer />}
                </div>
            )
        }

        return (
            <div id="status-menu">
                Players are giving clues for '{guesser?.name}' {settings?.cluesTimerEnabled && <Timer />}
            </div>
        )
    } else if (output.state.state === 'assessing-clues') {
        return (
            <div id="status-menu">
                Checking clues for duplicates
            </div>
        )
    } else if (output.state.state === 'guessing') {
        const guesserId = output.state.guesserId

        const guesser = output.players.find(player => player.id === guesserId)

        if (guesserId === output.yourId) {
            return (
                <div id="status-menu">
                    Waiting for YOU to guess
                </div>
            )
        }

        return (
            <div id="status-menu">
                '{guesser?.name}' is guessing the word
            </div>
        )
    } else {
        // (output.state.state === 'post-game')
        return (
            <div id="status-menu">
                Waiting to start the next round
            </div>
        )
    }
}

const LOOP_TIMEOUT = 250

const MINUTE_DURATION = 60_000
const SECOND_DURATION = 1_000

const getTimeFromMillisLeft = (millisLeft: number) => {
    if (millisLeft <= 0) {
        return '0:00'
    }

    const minutes = Math.floor(millisLeft / MINUTE_DURATION)

    const secondsLeft = Math.floor((millisLeft - minutes * MINUTE_DURATION) / SECOND_DURATION)

    return `${minutes}:${secondsLeft.toString().padStart(2, '0')}`
}

const Timer = () => {
    const [timeLeft, setTimeLeft] = useState('0:00')

    const { output, settings } = useGameContext()

    const remainingDuration = output.state.state === 'giving-clues' && settings?.cluesTimerEnabled
        ? output.state.remainingDuration
        : undefined

    useEffect(() => {
        if (typeof remainingDuration === 'number') {
            const endTime = performance.now() + remainingDuration

            setTimeLeft(getTimeFromMillisLeft(remainingDuration))

            const loop = setInterval(() => {
                const remainingTime = endTime - performance.now()

                setTimeLeft(getTimeFromMillisLeft(remainingTime))
            }, LOOP_TIMEOUT)

            return () => {
                clearInterval(loop)
            }
        }
    }, [remainingDuration])

    if (output.state.state !== 'giving-clues' || !settings?.cluesTimerEnabled) {
        return null
    }

    return <span>({timeLeft})</span>
}
