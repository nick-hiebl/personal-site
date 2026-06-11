import { useEffect, useState } from 'react'

import { useSocket } from './socket'

import './LobbyBrowser.css'

type Lobby<T> = {
    id: string
    details: T
}

type LobbyBrowserProps<LobbyDetails, RoomConfig> = {
    activityData: RoomConfig
    children: (id: string, details: LobbyDetails) => React.ReactNode
}

export const LobbyBrowser = function <LobbyDetails, T extends { activity: string }>({ activityData, children }: LobbyBrowserProps<LobbyDetails, T>) {
    const socket = useSocket(activityData, '')
    const [lobbies, setLobbies] = useState<Lobby<LobbyDetails>[]>([])

    useEffect(() => {
        if (!socket) {
            return
        }

        const onLobbies = ({ lobbies: newLobbies }: { lobbies: Lobby<LobbyDetails>[] }) => {
            setLobbies(newLobbies)
        }

        socket.on('lobbies', onLobbies)

        const onDeleted = ({ id }: { id: string }) => {
            setLobbies(current => current.filter(lobby => lobby.id !== id))
        }

        socket.on('lobby-deleted', onDeleted)

        const onUpdated = ({ id, details }: { id: string, details: LobbyDetails }) => {
            setLobbies(current => {
                if (current.some(lobby => lobby.id === id)) {
                    return current.map(lobby => lobby.id === id ? { id, details } : lobby)
                }

                return current.concat({ id, details })
            })
        }

        socket.on('lobby-update', onUpdated)

        return () => {
            socket.off('lobbies', onLobbies)
            socket.off('lobby-deleted', onDeleted)
            socket.off('lobby-update', onUpdated)
        }
    }, [socket])

    return (
        <ul className="lobby-browser">
            {lobbies.map(lobby => (
                <li key={lobby.id} className="lobby-row">
                    {children(lobby.id, lobby.details)}
                </li>
            ))}
        </ul>
    )
}
