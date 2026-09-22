import { SetName } from '../../../../../components/games/common/SetName'
import { useGameContext } from '../context'
import type { PlayerType } from '../types'

export const Lobby = () => {
    const { socket, output } = useGameContext()

    const me = output.players.find(p => p.id === output.yourId)

    const setRole = (role: PlayerType) => {
        socket.emit('setRole', { role })
    }

    return (
        <section>
            {output.state.state === 'pending' && (
                <SetName
                    currentName={me?.name}
                    onSetName={(name) => {
                        socket.emit('updateName', { name })
                    }}
                />
            )}
            <div className="row gap-4px">
                <button onClick={() => setRole('blind')}>Blind</button>
                <button onClick={() => setRole('deaf')}>Deaf</button>
                <button onClick={() => setRole('mute')}>Mute</button>
            </div>
        </section>
    )
}
