import { useCallback, useEffect, useState } from 'react'

import { BACKEND_BASE } from '../../../components/common/constants'
import { LobbyBrowser } from '../../../components/games/common/LobbyBrowser'

import { GeckoUpGame } from './game'
import { GAME_ACTIVITY, type GameActivity } from './game/constants'

type RoomProps = {
    numUsers: number
}

export const Game = () => {
    const [lobby, setLobby] = useState<string | undefined>(document.location.hash.slice(1) || undefined)
    const [lobbyInvalid, setLobbyInvalid] = useState(false)

    useEffect(() => {
        const onHashChange = () => {
            setLobby(document.location.hash.slice(1) || undefined)
        }

        addEventListener('hashchange', onHashChange)

        return () => {
            removeEventListener('hashchange', onHashChange)
        }
    }, [])

    const onLobbyNotFound = useCallback(() => {
        setLobbyInvalid(true)
    }, [])

    if (lobbyInvalid) {
        return (
            <section>
                <h1>Gecko up!</h1>
                <p>Lobby is invalid or no longer exists: {lobby}</p>
                <a href=".">Back to home</a>
            </section>
        )
    }

    if (!lobby) {
        return (
            <section>
                <h1>Gecko up!</h1>
                <button
                    onClick={async () => {
                        try {
                            const lobbyDetails = await fetch(`${BACKEND_BASE}/create`, {
                                method: 'POST',
                                body: JSON.stringify(GAME_ACTIVITY),
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                            }).then(res => res.json())

                            setLobby(lobbyDetails.code)
                            document.location.hash = lobbyDetails.code
                        } catch {
                            console.error('Failed to create lobby')
                        }
                    }}
                >
                    Create lobby
                </button>
                <LobbyBrowser<RoomProps, GameActivity> activityData={GAME_ACTIVITY}>
                    {(id, details) => (
                        <div>
                            {id}. Num users: {details.numUsers}
                            {' '}
                            <a href={`#${id}`}>Join</a>
                        </div>
                    )}
                </LobbyBrowser>
            </section>
        )
    }

    return <GeckoUpGame onLobbyNotFound={onLobbyNotFound} code={lobby} />
}
