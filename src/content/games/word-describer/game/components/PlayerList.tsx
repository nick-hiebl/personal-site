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
            {output.state.players.map((playerId) => {
                const { id, name } = output.players.find(p => p.id === playerId) ?? { id: playerId, name: 'Unknown player' }

                return (
                    <div key={id} className="player-item">
                        <span>{name}</span>
                        <div className="player-tag-list">
                            {id === guesserId && '🔍'}
                            {extraContent ? extraContent(id) : (
                                <ReadyNode playerId={id} />
                            )}
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
