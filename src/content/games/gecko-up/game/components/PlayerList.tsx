import { useGameContext } from '../context'

import './PlayerList.css'

export const PlayerList = () => {
    const { output: { players, state } } = useGameContext()

    if (state.state === 'pending') {
        return (
            <ul className="player-list">
                {players.map(player => (
                    <li key={player.id} className="player-list-item">
                        <span>{player.name}</span>
                        <span>{state.readyPlayers.includes(player.id) ? '✅' : '❌'}</span>
                    </li>
                ))}
            </ul>
        )
    }

    const currentTurn = state.state === 'active' ? state.currentTurn : undefined

    return (
        <ul className="player-list">
            {state.turnOrder.map(turnHaver => {
                const player = players.find(p => p.id === turnHaver)

                if (!player) {
                    return null
                }

                return (
                    <li key={player.id} className="player-list-item">
                        <span>{player.name}</span>
                        {currentTurn === player.id && 'My turn'}
                    </li>
                )
            })}
        </ul>
    )
}
