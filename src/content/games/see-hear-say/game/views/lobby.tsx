import { SetName } from '../../../../../components/games/common/SetName'
import { useGameContext } from '../context'
import type { PlayerType } from '../types'

import { Settings } from './Settings'

export const Lobby = () => {
    const { socket, output } = useGameContext()

    const me = output.players.find(p => p.id === output.yourId)

    const setRole = (role: PlayerType) => {
        socket.emit('setRole', { role })
    }

    return (
        <section>
            {output.state.state === 'pending' && (
                <div>
                    <SetName
                        currentName={me?.name}
                        onSetName={(name) => {
                            socket.emit('updateName', { name })
                        }}
                    />
                    <Settings />
                    <button
                        onClick={() => {
                            socket.emit('start')
                        }}
                    >
                        Start
                    </button>
                </div>
            )}
            {output.state.state !== 'pending' && output.settings.freeRoleSwitching && (
                <div className="row gap-4px">
                    <button onClick={() => setRole('blind')}>Blind</button>
                    <button onClick={() => setRole('deaf')}>Deaf</button>
                    <button onClick={() => setRole('mute')}>Mute</button>
                </div>
            )}
        </section>
    )
}
