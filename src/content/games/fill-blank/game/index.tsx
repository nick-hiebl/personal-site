import { useEffect, useState } from 'react'

import { useSocket } from '../../../../components/games/common/socket'
import { MenuTrigger } from '../../../../components/games/common/Menu'
import { SetName } from '../../../../components/games/common/SetName'

import { StatusMenu } from './components/StatusMenu'
import { FILL_BLANK_PASSWORD } from './constants'
import { GameContext, useGameContext } from './context'
import type { Output } from './types'

import { Pending } from './views/Pending'
import { Scoring } from './views/Scoring'
import { Submitting } from './views/Submitting'
import { PostGame } from './views/PostGame'

import './FillBlank.css'

type GameProps = {
    code: string
    onLobbyNotFound: () => void
}

const myToken = () => {
    return {
        name: localStorage.getItem('user-name') || undefined,
        token: localStorage.getItem(FILL_BLANK_PASSWORD) || undefined,
        activity: 'fill-blank',
    }
}

export const FillTheBlankGame = ({ code, onLobbyNotFound }: GameProps) => {
    const [isMenuOpen, setMenuOpen] = useState(false)

    const token = myToken()

    const socket = useSocket(token, code)
    const [state, setState] = useState<Output | undefined>()

    useEffect(() => {
        if (!socket) {
            return
        }

        const onGameState = (data: Output) => {
            setState(data)
            localStorage.setItem(FILL_BLANK_PASSWORD, data.password)
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
                <p>Ideally you should not be seeing this for long...</p>
            </section>
        )
    }

    const self = state.players.find(p => p.id === state.yourId)
    const isReadOnly = self?.status !== 'active'

    return (
        <GameContext.Provider value={{ isReadOnly, output: state, socket }}>
            <section>
                <div id="top-bar">
                    <StatusMenu />
                    <MenuTrigger>
                        {({ onClose }) => (
                            <MenuContents onClose={onClose} />
                        )}
                    </MenuTrigger>
                </div>
                {state.state.state === 'pending' ? (
                    <Pending />
                ) : state.state.state === 'submitting' ? (
                    <Submitting />
                ) : state.state.state === 'scoring' ? (
                    <Scoring />
                ) : state.state.state === 'post-game' ? (
                    <PostGame />
                ) : (
                    <div>
                        <h1>{code}</h1>
                        <pre>{JSON.stringify(state, null, 2)}</pre>
                    </div>
                )}
            </section>
        </GameContext.Provider>
    )
}

type MenuContentsProps = {
    onClose: () => void
}

const MenuContents = ({ onClose }: MenuContentsProps) => {
    const { output, socket } = useGameContext()

    const currentName = output.players.find(p => p.id === output.yourId)?.name

    return (
        <div>
            <h1>Menu</h1>
            <div className="column gap-16px">
                <SetName
                    currentName={currentName}
                    onSetName={(newName) => {
                        socket.emit('updateName', { name: newName })
                    }}
                />
                {output.hostPlayerId === output.yourId && output.state.state !== 'pending' && (
                    <div>
                        <div>Fully reset the game? Warning, this will happen immediately.</div>
                        <button
                            onClick={() => {
                                socket.emit('resetRound')
                                onClose()
                            }}
                        >
                            Reset round
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
