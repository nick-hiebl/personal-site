import { PlayerList } from '../components/PlayerList'
import { useGameContext } from '../context'

export const PostGame = () => {
    const { output } = useGameContext()

    if (output.state.state !== 'post-game') {
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
                <ul>
                    {output.state.players.map(player => {
                        const playerId = player.playerId

                        const realPlayer = output.players.find(p => p.id === playerId)

                        if (!realPlayer) {
                            return null
                        }

                        return (
                            <li key={player.id} className="stack gap-4px">
                                <span>
                                    {realPlayer.name}
                                    {' '}wanted{' '}
                                    {player.target}
                                </span>
                                <span>
                                    Submitted: {player.submission}
                                </span>
                            </li>
                        )
                    })}
                </ul>
                <pre>{JSON.stringify(output.state, null, 2)}</pre>
            </div>
        </div>
    )
}
