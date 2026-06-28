import { useEffect, useState } from 'react'

import { MenuTrigger } from '../../../../components/games/common/Menu'
import { useSocket } from '../../../../components/games/common/socket'

import { GECKO_UP_PASSWORD } from './constants'
import { GameContext } from './context'
import type { GameSettings, GameStateOutput } from './types'
import { PlayerList } from './components/PlayerList'
import { ActiveGame } from './views/ActiveGame'
import { Pending } from './views/Pending'

import './styles.css'

type GameProps = {
    code: string
    onLobbyNotFound: () => void
}

const myToken = () => {
    return {
        name: localStorage.getItem('user-name') || undefined,
        token: localStorage.getItem(GECKO_UP_PASSWORD) || undefined,
        activity: 'gecko-up',
    }
}

export const GeckoUpGame = ({ code, onLobbyNotFound }: GameProps) => {
    const token = myToken()

    const socket = useSocket(token, code)
    const [state, setState] = useState<GameStateOutput | undefined>()
    const [settings, setGameSettings] = useState<GameSettings | undefined>()

    useEffect(() => {
        if (!socket) {
            return
        }

        const onGameState = (data: GameStateOutput) => {
            setState(data)
            localStorage.setItem(GECKO_UP_PASSWORD, data.password)
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

    if (!state) {
        return (
            <section>
                <h1>Loading...</h1>
                <p>Ideally you should not be seeing this for long...</p>
            </section>
        )
    }

    return (
        <GameContext.Provider value={{ output: state, settings, socket }}>
            <div>
                <div id="top-bar">
                    <MenuTrigger>
                        <h1>Menu</h1>
                    </MenuTrigger>
                </div>
                <PlayerList />
                {state.state.state === 'pending' ? (
                    <Pending />
                ) : (
                    <ActiveGame />
                )}
            </div>
        </GameContext.Provider>
    )
}
