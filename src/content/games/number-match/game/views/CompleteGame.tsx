import { Grid } from '../components/Grid'
import { PlayerList } from '../components/PlayerList'
import { useGameContext } from '../context'
import type { CompleteOutput } from '../types'
import { ValueDetails } from '../components/ValueDetails'

import { EventLog } from './EventLog'

type Props = {
    state: CompleteOutput
}

export const CompleteGame = ({ state }: Props) => {
    const { output: { hostPlayerId, yourId }, socket } = useGameContext()

    return (
        <div className="stack gap-8px">
            <PlayerList />
            <h1>Complete</h1>
            <ValueDetails state={state} />
            <div className="stack gap-16px full-width">
                <div>
                    Errors: {state.errors}, Actions
                </div>
                <div className="stack stack-center gap-8px">
                    <h3>Your grids</h3>
                    <ul>
                        {state.grids.filter(grid => grid.ownerId === yourId).map(grid => (
                            <li key={grid.id}>
                                <Grid grid={grid} hideName />
                            </li>
                        ))}
                    </ul>
                    <h3>Others' grids</h3>
                    <ul>
                        {state.grids.filter(grid => grid.ownerId !== yourId).map(grid => (
                            <li key={grid.id}>
                                <Grid grid={grid} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {hostPlayerId === yourId && (
                <>
                    <br />
                    <div>
                        <button
                            onClick={() => {
                                socket.emit('resetRound')
                            }}
                        >
                            Play again
                        </button>
                    </div>
                </>
            )}
            <EventLog />
        </div>
    )
}
