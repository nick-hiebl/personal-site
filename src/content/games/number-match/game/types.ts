import type { Socket } from 'socket.io-client'

export type Player = {
    id: string
    socket: Socket
    name: string
    password: string
}

export type LobbyDetails = {
    numUsers: number
    stage: 'pending' | 'active'
}

export type ConnectOptions = {
    name?: string
    token?: string
}

export type Tag =
    | { type: 'value', value: number }

export type GridValue = {
    value: number
    revealed: boolean
    tags: Tag[]
}

export type Grid = {
    id: number
    ownerId: string
    width: number
    height: number
    values: GridValue[][]
}

export type ValueDetails = {
    value: number
    totalCount: number
}

export type PendingGameState = {
    state: 'pending'
    readyPlayers: string[]
}

export type GameState = {
    state: 'active'
    valueDetails: ValueDetails[]
    grids: Grid[]
}

export type OutputGridValue = {
    value: number | undefined
    revealed: boolean
    tags: Tag[]
}

export type OutputGrid = Omit<Grid, 'values'> & {
    type: 'partial'
    values: OutputGridValue[][]
}

export type GameStateOutput = {
    players: Pick<Player, 'id' | 'name'>[]
    yourId: string
    password: string
    lobby: string
    hostPlayerId: string
    state: PendingGameState | ActiveOutput
}

export type ActiveOutput = {
    state: 'active'
    valueDetails: ValueDetails[]
    grids: ((Grid & { type: 'full' }) | OutputGrid)[]
}
