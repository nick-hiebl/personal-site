import { useGameContext } from '../context'

import { Toggle } from './Toggle'

export const ReadyUp = () => {
    const { output, socket } = useGameContext()

    console.log('Working with', output.state)

    const isReady = 'readyPlayerIds' in output.state && output.state.readyPlayerIds.includes(output.yourId)

    const onReady = (ready: boolean) => socket.emit('ready', { isReady: ready })

    return (
        <div id="ready-up">
            <div className="big-text">
                <Toggle id="ready" value={isReady} onChange={onReady}>Ready</Toggle>
            </div>
        </div>
    )
}