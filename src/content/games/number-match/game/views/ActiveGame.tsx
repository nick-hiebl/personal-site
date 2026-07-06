import { useEffect, useState } from 'react'

import { Grid } from '../components/Grid'
import { Items } from '../components/Items/ItemComponent'
import { PlayerList } from '../components/PlayerList'
import { ValueDetails } from '../components/ValueDetails'
import { useGameContext } from '../context'
import type { Coordinate, ActiveOutput } from '../types'

import { EventLog } from './EventLog'

type Props = {
    state: ActiveOutput
}

export const ActiveGame = ({ state }: Props) => {
    const { output: { yourId }, socket } = useGameContext()
    const [myCoord, setMyCoord] = useState<Coordinate | undefined>(undefined)
    const [otherCoord, setOtherCoord] = useState<Coordinate | undefined>(undefined)

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

    const amIRevealing = actionType === 'reveal' && state.action.revealingUser === yourId

    useEffect(() => {
        if (amIRevealing) {
            setMyCoord(undefined)
        }
    }, [amIRevealing])

    return (
        <div className="stack gap-8px">
            <PlayerList
                extraContent={playerId => {
                    if (actionType === 'reveal' && state.action.revealingUser === playerId) {
                        return <span>🔎</span>
                    } else if (actionType === 'claim' && state.action.users.includes(playerId)) {
                        return <span>🤔</span>
                    } else if (actionType === 'guess' && state.action.user === playerId) {
                        return <span>🔎</span>
                    } else if (actionType === 'tag' && state.action.users.includes(playerId)) {
                        return <span>❓</span>
                    }
                }}
            />
            <h1>Active</h1>
            <ValueDetails state={state} />
            <div className="stack gap-16px full-width">
                <div className="row-center gap-4px">
                    <span>Errors: {state.errors}, Actions</span>
                    {actionType === 'tag' && isMyAction && (
                        <button
                            disabled={!myCoord}
                            onClick={() => {
                                if (!myCoord) {
                                    return
                                }

                                socket.emit('tagCell', { coordinate: myCoord })
                            }}
                        >
                            Submit tag
                        </button>
                    )}
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
                    {amIRevealing && state.action.type === 'reveal' && (
                        <div>
                            <div>Select a {state.action.revealValue} to reveal from your highlighted grid.</div>
                            <button
                                disabled={!myCoord}
                                onClick={() => {
                                    socket.emit('reveal-action-value', { coordinate: myCoord })
                                }}
                            >
                                Reveal
                            </button>
                        </div>
                    )}
                    <h3>Your grids</h3>
                    <ul>
                        {state.grids.filter(grid => grid.ownerId === yourId).map(grid => (
                            <li key={grid.id}>
                                <Grid
                                    grid={grid}
                                    isGridSelected={amIRevealing && state.action.type === 'reveal' && state.action.revealGrid === grid.id}
                                    onSelectCoordinate={coord => setMyCoord(coord)}
                                    selectedCoordinate={myCoord}
                                    isCellInteractive={cell => {
                                        if (cell.revealed) {
                                            return false
                                        }

                                        if (state.action.type === 'reveal' && amIRevealing) {
                                            return cell.value === state.action.revealValue
                                        } else {
                                            return actionType === 'guess' || actionType === 'tag'
                                        }
                                    }}
                                />
                            </li>
                        ))}
                    </ul>
                    <h3>Others' grids</h3>
                    <ul>
                        {state.grids.filter(grid => grid.ownerId !== yourId).map(grid => (
                            <li key={grid.id} className="column flex-center">
                                {grid.ownerId === '' && actionType === 'claim' && state.action.users.includes(yourId) && (
                                    <button
                                        onClick={() => {
                                            socket.emit('claimGrid', { gridId: grid.id })
                                        }}
                                    >
                                        Claim
                                    </button>
                                )}
                                <Grid
                                    grid={grid}
                                    onSelectCoordinate={coord => setOtherCoord(coord)}
                                    selectedCoordinate={otherCoord}
                                    isCellInteractive={cell => (actionType === 'guess' && !cell.revealed)}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <Items />
            <EventLog />
        </div>
    )
}
