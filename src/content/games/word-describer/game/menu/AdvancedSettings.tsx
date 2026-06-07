import { useEffect, useState } from 'react'

import { useGameContext } from '../context'

export const AdvancedSettings = () => {
    const { output, socket } = useGameContext()
    const [alreadyPressedOnce, setSure] = useState(false)

    const { avoidedPlayers, hostPlayerId, players, state, yourId } = output

    const resetKey = state.state === 'pending' ? '--' : `${state.guesserId}--${'secretWord' in state ? state.secretWord : '--'}`

    useEffect(() => {
        setSure(false)
    }, [resetKey])

    if (yourId !== hostPlayerId) {
        return <div>You shouldn't be able to see this</div>
    }

    return (
        <div className="stack gap-8px">
            <div className="stack gap-8px">
                {state.state === 'pending' && (
                    <div>
                        Ejecting players now will temporarily remove them but won't prevent them from rejoining.
                        I honestly don't know right now what this will achieve.
                    </div>
                )}
                {state.state !== 'pending' && (
                    <div className="inline spread stack-center">
                        Start a new round
                        <button
                            onClick={() => {
                                if (alreadyPressedOnce) {
                                    socket.emit('resetRound')
                                } else {
                                    setSure(true)
                                }
                            }}
                        >
                            {alreadyPressedOnce ? 'Are you sure' : 'Reset'}
                        </button>
                    </div>
                )}
                <strong>Players:</strong>
                {players.filter(player => !avoidedPlayers.some(avoidedId => avoidedId === player.id)).map(player => (
                    <div className="inline spread stack-center">
                        <div className="inline gap-8px stack-center">
                            {player.name}
                            {player.id === yourId && <em>(you)</em>}
                        </div>
                        <button
                            onClick={() => {
                                if (state.state === 'pending') {
                                    socket.emit('eject', { playerId: player.id })
                                } else {
                                    socket.emit('avoidGuesser', { guesserId: player.id, allow: false })
                                }
                            }}
                        >
                            {state.state === 'pending' ? 'Eject' : 'Remove'}
                        </button>
                    </div>
                ))}
            </div>
            {avoidedPlayers.length > 0 && (
                <div className="stack gap-8px">
                    <strong>Players who can't be guessers:</strong>
                    <div className="stack gap-8px">
                        {avoidedPlayers.map(playerId => (
                            <div className="inline spread stack-center">
                                <div className="inline gap-8px stack-center">
                                    {players.find(realPlayer => realPlayer.id === playerId)?.name ?? 'Unknown player 73'}
                                    {playerId === yourId && <em>(you)</em>}
                                </div>
                                <button
                                    onClick={() => {
                                        socket.emit('avoidGuesser', { guesserId: playerId, allow: true })
                                    }}
                                >
                                    Allow
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
