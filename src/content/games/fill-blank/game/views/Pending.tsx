import { SetName } from '../../../../../components/games/common/SetName'
import { PlayerList } from '../components/PlayerList'
import { useGameContext } from '../context'

export const Pending = () => {
    const { output, socket } = useGameContext()

    const currentName = output.players.find(p => p.id === output.yourId)?.name

    if (output.state.state !== 'pending') {
        return null
    }

    const isReady = output.state.readyPlayerIds.includes(output.yourId)

    return (
        <div className="stack gap-8px">
            <PlayerList />
            <div className="stack gap-16px">
                <div className="stack stack-center gap-8px">
                    <div>The room code is:</div>
                    <div className="big-text">
                        {window.location.hash.slice(1)}
                    </div>
                </div>
                <div className="stack stack-center gap-8px">
                    <SetName
                        currentName={currentName}
                        onSetName={(newName) => {
                            socket.emit('updateName', { name: newName })
                        }}
                    />
                    <button
                        onClick={() => {
                            socket.emit('ready', { isReady: !isReady })
                        }}
                    >
                        Ready
                        {isReady ? ' ✅' : ' ❌'}
                    </button>
                </div>
            </div>
        </div>
    )
}
