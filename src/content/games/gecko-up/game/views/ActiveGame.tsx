import { Board } from '../components/Board'
import { useGameContext } from '../context'

export const ActiveGame = () => {
    const { socket } = useGameContext()

    return (
        <div>
            <Board />
            <button
                onClick={() => {
                    socket.emit('rollADie')
                }}
            >
                Roll
            </button>
        </div>
    )
}
