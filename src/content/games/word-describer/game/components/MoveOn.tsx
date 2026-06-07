import { useGameContext } from '../context'

import { Toggle } from './Toggle'

export const MoveOn = ({ subtitle, title }: {
    subtitle?: string
    title?: string
}) => {
    const { output, socket } = useGameContext()

    const isReady = 'readyPlayerIds' in output.state && output.state.readyPlayerIds.includes(output.yourId)

    const onReady = (ready: boolean) => {
        socket.emit('ready', { isReady: ready })
    }

    return (
        <div id="ready-up" className="center-column">
            <Toggle id="move-on" value={isReady} onChange={onReady}>
                <div className="big-text">
                    {title ?? 'Move on'}
                </div>
            </Toggle>
            {subtitle ?? (isReady ? 'Others need to press this button' : 'Go to the next round')}
        </div>
    )
}
