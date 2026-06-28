import { useGameContext } from '../context'

export const Pending = () => {
    const { output, socket } = useGameContext()

    if (output.state.state !== 'pending') {
        return null
    }

    return (
        <section>
            <label>
                <input
                    type="checkbox"
                    onChange={event => {
                        socket.emit('ready', { isReady: event.currentTarget.checked })
                        console.log('READY', event.currentTarget.checked)
                    }}
                    checked={output.state.readyPlayers.includes(output.yourId)}
                />
                Ready up
            </label>
        </section>
    )
}
