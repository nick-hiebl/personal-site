import { useEffect, useState } from 'react'

import { Grid } from '../components/Grid'
import { PlayerList } from '../components/PlayerList'
import { useGameContext } from '../context'
import type { Coordinate, ActiveOutput } from '../types'
import { ValueDetails } from '../components/ValueDetails'

type Props = {
    state: ActiveOutput
}

export const ActiveGame = ({ state }: Props) => {
    const { output: { yourId }, socket } = useGameContext()
    const [myCoord, setMyCoord] = useState<Coordinate | undefined>()
    const [otherCoord, setOtherCoord] = useState<Coordinate | undefined>()

    const actionType = state.action.type
    const isMyAction = state.action.type === 'guess'
        ? state.action.user === yourId
        : state.action.type === 'tag'
            ? state.action.users.includes(yourId)
            : false

    useEffect(() => {
        setMyCoord(undefined)
        setOtherCoord(undefined)
    }, [actionType, isMyAction])

    return (
        <div className="stack gap-8px">
            <PlayerList />
            <h1>Active</h1>
            <ValueDetails state={state} />
            <div className="stack gap-16px">
                <div>
                    Errors: {state.errors}, Actions
                    {actionType === 'guess' && isMyAction && (
                        <button
                            disabled={!myCoord || !otherCoord}
                            onClick={() => {
                                socket.emit('makeGuess', {
                                    myCoord,
                                    otherCoord,
                                })
                            }}
                        >
                            Submit guess
                        </button>
                    )}
                </div>
                <div className="stack stack-center gap-8px">
                    <div>Your grids</div>
                    <ul>
                        {state.grids.filter(grid => grid.ownerId === yourId).map(grid => (
                            <li key={grid.id}>
                                <Grid
                                    grid={grid}
                                    onSelectCoordinate={coord => setMyCoord(coord)}
                                    selectedCoordinate={myCoord}
                                    hideName
                                />
                            </li>
                        ))}
                    </ul>
                    <div>Others' grids</div>
                    <ul>
                        {state.grids.filter(grid => grid.ownerId !== yourId).map(grid => (
                            <li key={grid.id}>
                                <Grid
                                    grid={grid}
                                    onSelectCoordinate={coord => setOtherCoord(coord)}
                                    selectedCoordinate={otherCoord}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}
