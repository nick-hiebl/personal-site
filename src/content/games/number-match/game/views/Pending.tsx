import { PlayerList } from '../components/PlayerList'
import { ReadyUp } from '../components/ReadyUp'
// import { SetName } from '../components/SetName'
import { useGameContext } from '../context'

export const Pending = () => {
    const { output } = useGameContext()

    if (output.state.state !== 'pending') {
        return null
    }

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
                    {/* <SetName /> */}
                    <ReadyUp />
                </div>
            </div>
        </div>
    )
}
