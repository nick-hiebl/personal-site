import { SetName } from '../../../../../components/games/common/SetName'
import { PlayerList } from '../components/PlayerList'
import { ReadyUp } from '../components/ReadyUp'
// import { SetName } from '../components/SetName'
import { useGameContext } from '../context'

type Props = {
    code: string
}

export const Pending = ({ code }: Props) => {
    const { output, socket } = useGameContext()

    if (output.state.state !== 'pending') {
        return null
    }

    const currentName = output.players.find(p => p.id === output.yourId)?.name

    return (
        <div className="stack gap-8px">
            <PlayerList />
            <div className="stack gap-16px">
                <div className="stack stack-center gap-8px">
                    <div>The room code is:</div>
                    <div className="big-text">{code}</div>
                </div>
                <div className="stack stack-center gap-8px">
                    <SetName
                        currentName={currentName}
                        onSetName={(newName: string) => {
                            socket.emit('updateName', { name: newName })
                        }}
                    />
                    <ReadyUp />
                </div>
            </div>
        </div>
    )
}
