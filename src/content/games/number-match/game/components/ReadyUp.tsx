import { useGameContext } from '../context'

import { Toggle } from './Toggle'

export const ReadyUp = () => {
    const { output, socket } = useGameContext()

    const isReady = 'readyPlayers' in output.state && output.state.readyPlayers.includes(output.yourId)

    const onReady = (ready: boolean) => socket.emit('ready', { isReady: ready })

    return (
        <div id="ready-up">
            <div className="big-text">
                <Toggle id="ready" value={isReady} onChange={onReady}>Ready</Toggle>
            </div>
        </div>
    )
}