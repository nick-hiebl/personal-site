import { MoveOn } from '../components/MoveOn'
import { PlayerList } from '../components/PlayerList'
import { ResultsTable } from '../components/ResultsTable'
import { useGameContext } from '../context'

export const PostGame = () => {
    const { output } = useGameContext()

    if (output.state.state !== 'post-game') {
        return null
    }

    return (
        <div id="post-game" className="stack-8px">
            <PlayerList />
            <ResultsTable clues={output.state.clues} theWord={output.state.secretWord} guess={output.state.guess} />
            <MoveOn />
        </div>
    )
}
