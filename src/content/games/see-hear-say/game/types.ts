import type { Socket } from 'socket.io-client'

/* Network */

export type LobbyDetails = {
    numUsers: number
    stage: 'pending' | 'active' | 'complete'
}

export type ConnectOptions = {
    name?: string
    token?: string
}

/* Common */

export type PlayerType = 'blind' | 'deaf' | 'mute'

export type BaseColor = 'red' | 'yellow' | 'green' | 'blue'
export type BlindColor = 'color'

export type Player = {
    id: string
    type: PlayerType
    socket: Socket
    name: string
    password: string
}

/* Modules */

export type WireModule = {
    id: 'wire'
    blind: {
        id: 'wire'
        index: number
        wires: BlindColor[]
        light: BlindColor
        cut: boolean[]
        complete: boolean
    }
    deaf: {
        id: 'wire'
        index: number
        wires: BaseColor[]
        light: BaseColor
        cut: boolean[]
        complete: boolean
    }
    mute: {
        id: 'wire'
        // rule[3]['red'] === 'blue' means
        // if there are 3 wires and a red light, cut the blue wire
        rule: Record<number, Record<BaseColor, BaseColor>>
    }
    state: {
        id: 'wire'
        index: number
        position: number
        wires: BaseColor[]
        light: BaseColor
        cut: boolean[]
        complete: boolean
    }
}

export type Module = | WireModule

export type Rules = Record<Module['id'], Module['mute']>

/* Internal state */

export type GameState = {
    type: 'pending'
} | {
    type: 'active'
    rules: Rules
    puzzles: Module['state'][]
    complete: boolean
    lives: number
    totalLives: number
    totalTime: number
    startTime: number
    endTimeRemaining: number | undefined
}

/* States */

export type PendingState = {
    state: 'pending'
}

export type BlindState = {
    state: 'blind'
    data: Module['blind'][]
    complete: boolean
}

export type DeafState = {
    state: 'deaf'
    data: Module['deaf'][]
    lives: number
    totalLives: number
    timeLeft: number
    complete: boolean
}

export type MuteState = {
    state: 'mute'
    rules: Rules
    complete: boolean
}

export type GameStateDetails = 
    | PendingState
    | BlindState
    | DeafState
    | MuteState

export type GameStateOutput = {
    state: GameStateDetails
    players: Pick<Player, 'id' | 'name' | 'type'>[]
    yourId: string
    password: string
    lobby: string
}
