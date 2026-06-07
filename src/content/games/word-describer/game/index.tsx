import { useEffect, useState } from 'react'

import { useSocket } from '../../../../components/games/common/socket'

import { StatusMenu } from './components/StatusMenu'
import { WORD_DESCRIBER_PASSWORD } from './constants'
import { GameContext } from './context'
import { Menu } from './menu'
import type { GameSettings, Output } from './types'

import './WordDescriber.css'
import { Pending } from './views/Pending'
import { GivingClues } from './views/GivingClues'
import { AssessingClues } from './views/AssessingClues'
import { Guessing } from './views/Guessing'
import { PostGame } from './views/PostGame'

type GameProps = {
    code: string
    onLobbyNotFound: () => void
}

const myToken = () => {
    return {
        name: localStorage.getItem('user-name') || undefined,
        token: localStorage.getItem(WORD_DESCRIBER_PASSWORD) || undefined,
        activity: 'word-describer',
    }
}

export const WordDescriberGame = ({ code, onLobbyNotFound }: GameProps) => {
    const [isMenuOpen, setMenuOpen] = useState(false)

    const token = myToken()

    const socket = useSocket(token, code)
    const [state, setState] = useState<Output | undefined>()
    const [settings, setGameSettings] = useState<GameSettings | undefined>()

    useEffect(() => {
        if (!socket) {
            return
        }

        const onGameState = (data: Output) => {
            setState(data)
            localStorage.setItem(WORD_DESCRIBER_PASSWORD, data.password)
        }

        const onGameSettings = (data: GameSettings) => {
            setGameSettings(data)
        }

        socket.on('gameState', onGameState)
        socket.on('gameSettings', onGameSettings)

        socket.on('not-found', onLobbyNotFound)

        return () => {
            socket.off('gameState', onGameState)
            socket.off('gameSettings', onGameSettings)

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

    if (!state || !settings) {
        return (
            <section>
                <h1>Loading...</h1>
                <p>Ideally you should not be seeing this for long...</p>
            </section>
        )
    }

    return (
        <GameContext.Provider value={{ output: state, settings, socket }}>
            <section>
                <Menu isOpen={isMenuOpen} onClose={() => setMenuOpen(false)} code={code} />
                <div id="top-bar">
                    <StatusMenu />
                    <button id="menu-trigger" onClick={() => setMenuOpen(current => !current)}>☰</button>
                </div>
                {state.state.state === 'pending' ? (
                    <Pending />
                ) : state.state.state === 'giving-clues' ? (
                    <GivingClues />
                ) : state.state.state === 'assessing-clues' ? (
                    <AssessingClues />
                ) : state.state.state === 'guessing' ? (
                    <Guessing />
                ) : state.state.state === 'post-game' ? (
                    <PostGame />
                ) : (
                    <div>
                        <h1>{code}</h1>
                        <pre>{JSON.stringify(state, null, 2)}</pre>
                        <pre>{JSON.stringify(settings, null, 2)}</pre>
                    </div>
                )}
            </section>
        </GameContext.Provider>
    )
}
