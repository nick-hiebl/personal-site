import { useEffect, useState } from 'react'
import { io, type Socket } from 'socket.io-client'

import { BACKEND_BASE } from '../../common/constants'

import { loadName } from './name'

export const useSocket = <T extends { activity: string }>(
    /**
     * This really needs to be as stable as possible to avoid undesirable re-renders which will
     * kill and reset connections a lot.
     */
    config: T,
    lobbyCode: string,
) => {
    const [socket, setSocket] = useState<Socket>()

    useEffect(() => {
        const name = loadName()

        const newSocket = io(BACKEND_BASE, { query: { name, ...config, code: lobbyCode } })
        setSocket(newSocket)

        return () => {
            newSocket.disconnect()
        }
    }, [lobbyCode])

    return socket
}
