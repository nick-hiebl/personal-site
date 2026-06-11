import { useEffect, useState } from 'react'

import { useSocket } from '../../../../components/games/common/socket'

// import { StatusMenu } from './components/StatusMenu'
import { NUMBER_MATCH_PASSWORD } from './constants'
import { GameContext } from './context'
// import { Menu } from './menu'
import type { GameStateOutput } from './types'
import { Pending } from './views/Pending'
import { ActiveGame } from './views/ActiveGame'
import { CompleteGame } from './views/CompleteGame'

import './game.css'

type GameProps = {
    code: string
    onLobbyNotFound: () => void
}

const myToken = () => {
    return {
        name: localStorage.getItem('user-name') || undefined,
        token: localStorage.getItem(NUMBER_MATCH_PASSWORD) || undefined,
        activity: 'number-match',
    }
}

export const NumberMatchGame = ({ code, onLobbyNotFound }: GameProps) => {
    // const [isMenuOpen, setMenuOpen] = useState(false)

    const token = myToken()

    const socket = useSocket(token, code)
    const [state, setState] = useState<GameStateOutput | undefined>()
    // const [settings, setGameSettings] = useState<GameSettings | undefined>()

    useEffect(() => {
        if (!socket) {
            return
        }

        const onGameState = (data: GameStateOutput) => {
            setState(data)
            localStorage.setItem(NUMBER_MATCH_PASSWORD, data.password)
        }

        // const onGameSettings = (data: GameSettings) => {
        //     setGameSettings(data)
        // }

        socket.on('gameState', onGameState)
        // socket.on('gameSettings', onGameSettings)

        socket.on('not-found', onLobbyNotFound)

        return () => {
            socket.off('gameState', onGameState)
            // socket.off('gameSettings', onGameSettings)

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
                <p>Ideally you should not be seeing this for long...</p>
            </section>
        )
    }

    const { players, ...stateWithoutPlayers } = state

    return (
        <GameContext.Provider value={{ output: state, socket }}>
            <section>
                {/* <Menu isOpen={isMenuOpen} onClose={() => setMenuOpen(false)} code={code} /> */}
                <div id="top-bar">
                    Number match game ({code})
                    {/* <StatusMenu /> */}
                    {/* <button id="menu-trigger" onClick={() => setMenuOpen(current => !current)}>☰</button> */}
                </div>
                {state.state.state === 'pending' ? (
                    <Pending code={code} />
                ) : state.state.state === 'active' ? (
                    <ActiveGame state={state.state} />
                ) : state.state.state === 'complete' ? (
                    <CompleteGame state={state.state} />
                // )
                // ) : state.state.state === 'giving-clues' ? (
                //     <GivingClues />
                // ) : state.state.state === 'assessing-clues' ? (
                //     <AssessingClues />
                // ) : state.state.state === 'guessing' ? (
                //     <Guessing />
                // ) : state.state.state === 'post-game' ? (
                //     <PostGame />
                ) : (
                    <div>
                        <h1>{code}</h1>
                        <pre>{JSON.stringify(stateWithoutPlayers, null, 2)}</pre>
                        {/* <pre>{JSON.stringify(settings, null, 2)}</pre> */}
                    </div>
                )}
            </section>
        </GameContext.Provider>
    )
}
