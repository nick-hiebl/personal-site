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

export type DirectionModulePhase = 0 | 1 | 2 | 3 | 4

export type Direction = 'up' | 'down' | 'left' | 'right'

export type DirectionModule = {
    id: 'direction'
    blind: {
        id: 'direction'
        index: number
        light: BlindColor
        digit: number
        phase: DirectionModulePhase
        complete: boolean
    }
    deaf: {
        id: 'direction'
        index: number
        light: BaseColor
        // Incorrect digit
        digit: number
        phase: DirectionModulePhase
        complete: boolean
    }
    mute: {
        id: 'direction'
        rule: Record<number, Record<BaseColor, Direction>>
    }
    state: {
        id: 'direction'
        index: number
        position: number
        light: BaseColor
        digit: number
        phase: DirectionModulePhase
        complete: boolean
    }
}

export type Symbol = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j'

export type SymbolModule = {
    id: 'symbol'
    blind: {
        id: 'symbol'
        index: number
        symbols: Symbol[]
        direction: Direction
        noiseSymbol: Symbol
        buttons: BlindColor[]
        phase: DirectionModulePhase
        complete: boolean
    }
    deaf: {
        id: 'symbol'
        index: number
        symbols: Symbol[]
        direction: Direction
        buttons: BaseColor[]
        phase: DirectionModulePhase
        complete: boolean
    }
    mute: {
        id: 'symbol'
        // rule['a'][2] === 'red' means
        // in stage 2, if the noise symbol is 'a', press the red button
        rule: Record<Symbol, BaseColor[]>
    }
    state: {
        id: 'symbol'
        index: number
        position: number
        symbols: Symbol[]
        direction: Direction
        noiseSymbol: Symbol
        buttons: BaseColor[]
        phase: DirectionModulePhase
        complete: boolean
    }
}

export type Module =
    | WireModule
    | DirectionModule
    | SymbolModule

export type Rules = {
    direction: DirectionModule['mute']
    symbol: SymbolModule['mute']
    wire: WireModule['mute']
}

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
