import { useGameContext } from '../context'
import { idOfGuesser } from '../utils'

type PlayerListProps = {
    extraContent?: (playerId: string) => React.ReactNode
}

export const PlayerList = ({ extraContent }: PlayerListProps) => {
    const { output } = useGameContext()

    const guesserId = idOfGuesser(output)

    return (
        <div id="player-list">
            {output.players.filter(p => output.state.state === 'pending' || p.status !== 'waiting').map(player => {
                return (
                    <div key={player.id} className="player-item">
                        <span>{player.name}</span>
                        <div className="player-tag-list">
                            {player.id === guesserId && '🔍'}
                            {extraContent ? extraContent(player.id) : (
                                <ReadyNode playerId={player.id} />
                            )}
                            {player.status === 'disconnected' && '📵'}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

const ReadyNode = ({ playerId }: { playerId: string }) => {
    const { output: state } = useGameContext()

    switch (state.state.state) {
        default:
        case 'guessing':
            return null
        case 'assessing-clues':
        case 'giving-clues':
        case 'pending':
            if (playerId === idOfGuesser(state)) {
                return null
            }

            if (state.state.readyPlayerIds.includes(playerId)) {
                return <span>✅</span>
            } else {
                return <span>❌</span>
            }
        case 'post-game':
            if (state.state.readyPlayerIds.includes(playerId)) {
                return <span>✅</span>
            } else {
                return <span>❌</span>
            }
    }
}
