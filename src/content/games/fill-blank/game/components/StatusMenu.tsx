import { useGameContext } from '../context'

import './StatusMenu.css'

export const StatusMenu = () => {
    const { output } = useGameContext()

    if (output.state.state === 'pending') {
        return (
            <div id="status-menu">
                Waiting for everyone to join and ready up
            </div>
        )
    } else if (output.state.state === 'submitting') {
        const submitted = output.state.readyPlayerIds.length
        const p = output.players.length

        return (
            <div id="status-menu">
                Submitting words to fill the blank ({submitted}/{p})
            </div>
        )
    } else if (output.state.state === 'scoring') {
        const submitted = output.state.readyPlayerIds.length
        const p = output.players.length

        return (
            <div id="status-menu">
                Players are ranking their options ({submitted}/{p})
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
