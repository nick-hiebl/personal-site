import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import { BACKEND_BASE } from '../../../common/constants'

export type GameOptions = {
    onLobbyNotFound: () => void
    lobby: string
}

export type Props = {
    activity: string
    title: React.ReactNode
    lobbyBrowser: React.ReactNode
    game: (options: GameOptions) => ReactNode
}

export const CoreGameLobby = ({ activity, game, lobbyBrowser, title }: Props) => {
    const [lobby, setLobby] = useState<string | undefined>(document.location.hash.slice(1) || undefined)
    const [lobbyInvalid, setLobbyInvalid] = useState(false)
    const activityData = useMemo(() => ({ activity }), [activity])

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
                {title}
                <p>Lobby is invalid or no longer exists: {lobby}</p>
                <a href=".">Back to home</a>
            </section>
        )
    }

    if (!lobby) {
        return (
            <section>
                {title}
                <button
                    onClick={async () => {
                        try {
                            const lobbyDetails = await fetch(`${BACKEND_BASE}/create`, {
                                method: 'POST',
                                body: JSON.stringify(activityData),
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
                {lobbyBrowser}
            </section>
        )
    }

    return game({ onLobbyNotFound, lobby })
}
