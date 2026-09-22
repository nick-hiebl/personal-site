import { useEffect, useState } from 'react'

import { useSocket } from '../../../../components/games/common/socket'
import { ThemeSwitcher } from '../../../../components/ThemeSwitcher'

import { SEE_HEAR_SAY_PASSWORD } from './constants'
import { GameContext } from './context'
import type { GameStateOutput } from './types'
import { BlindView } from './views/blind'
import { Lobby } from './views/lobby'
import { DeafView } from './views/deaf'
import { MuteView } from './views/mute'

import './see-hear-say.css'

type GameProps = {
    code: string
    onLobbyNotFound: () => void
}

const myToken = () => {
    return {
        name: localStorage.getItem('user-name') || undefined,
        token: localStorage.getItem(SEE_HEAR_SAY_PASSWORD) || undefined,
        activity: 'see-hear-say',
    }
}

export const SeeHearSay = ({ code, onLobbyNotFound }: GameProps) => {
    const token = myToken()

    const socket = useSocket(token, code)
    const [state, setState] = useState<GameStateOutput | undefined>()

    useEffect(() => {
        if (!socket) {
            return
        }

        const onGameState = (data: GameStateOutput) => {
            setState(data)
            localStorage.setItem(SEE_HEAR_SAY_PASSWORD, data.password)
        }

        socket.on('gameState', onGameState)

        socket.on('not-found', onLobbyNotFound)

        return () => {
            socket.off('gameState', onGameState)

            socket.off('not-found', onLobbyNotFound)
        }
    }, [onLobbyNotFound, socket])

    if (!socket) {
        return (
            <section>
                <h1>Loading...</h1>
                <p>If this is up for a while: Error: NOSOCKET</p>
            </section>
        )
    }

    if (!state) {
        return (
            <section>
                <h1>Loading...</h1>
                <p>Ideally you should not be seeing this for long... NOSTATE</p>
            </section>
        )
    }

    const me = state.players.find(p => p.id === state.yourId)

    return (
        <GameContext.Provider value={{ output: state, socket }}>
            <section>
                <div className="column gap-16px">
                    <h1>Game!</h1>
                    {state.state.state !== 'pending' && state.state.complete && (
                        <h2>Success!</h2>
                    )}
                    <Lobby />
                    {me?.type === 'blind' ? (
                        <BlindView />
                    ) : me?.type === 'deaf' ? (
                        <DeafView />
                    ) : me?.type === 'mute' ? (
                        <MuteView />
                    ) : null}
                    <pre>{JSON.stringify(state, null, 2)}</pre>
                </div>
                <ThemeSwitcher />
            </section>
        </GameContext.Provider>
    )
}
