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

export type MatchWord = 'check' | 'confirm' | 'ok' | 'submit'

export type MatchChart = 'a' | 'b' | 'c' | 'd'

export type MatchModule = {
    id: 'match'
    blind: {
        id: 'match'
        index: number
        pairs: [number, number][]
        complete: boolean
    }
    deaf: {
        id: 'match'
        index: number
        pairs: [number, number][]
        toggles: ('red' | 'green')[]
        word: MatchWord
        complete: boolean
    }
    mute: {
        id: 'match'
        // wordToChart['ok'] = 'a' means
        // word 'ok' corresponds to using chart 'a'
        wordToChart: Record<MatchWord, MatchChart>
        // chartLayout['a'] = [1, 2, 3, 4, 5, 6, 7, 8] means
        // those numbers are placed in that order in the chart for 'a'
        chartLayout: Record<MatchChart, number[]>
    }
    state: {
        id: 'match'
        index: number
        position: number
        pairs: [number, number][]
        toggles: ('red' | 'green')[]
        word: MatchWord
        complete: boolean
    }
}

export type ChartFunction =
    'mxc' | 'fstat' | 'overload' | 'reset' | 'clrnc' | 'spf'

export type ChartFunctionBehavior = {
    plus: 'increase' | 'decrease'
    minus: 'increase' | 'decrease'
    slash: 'glow' | 'color'
}

export type ChartModule = {
    id: 'chart'
    blind: {
        id: 'chart'
        index: number
        glow: boolean
        incActive: 'plus' | 'minus' | 'none'
        slashPressed: boolean
        complete: boolean
    }
    deaf: {
        id: 'chart'
        index: number
        displayFunction: ChartFunction
        colorChanged: boolean
        incActive: 'plus' | 'minus' | 'none'
        slashPressed: boolean
        resetIndex: number
        output: number
        complete: boolean
    }
    mute: {
        id: 'chart'
        functions: Record<ChartFunction, ChartFunctionBehavior>
    }
    state: {
        id: 'chart'
        index: number
        position: number
        realFunction: ChartFunction
        displayFunction: ChartFunction
        incActive: 'plus' | 'minus' | 'none'
        slashPressed: boolean
        resetIndex: number
        complete: boolean
    }
}

export type WashingSpecial = 'dry-clean' | 'non-chlorine-bleach'
export type WashingTempTrue = 30 | 40 | 50 | 60 | 70 | 95
export type WashingTemp = '30' | '40' | '50' | '60' | '70' | '95' | `dot-${1 | 2 | 3 | 4 | 5 | 6}`
export type WashingDry = 'tumble' | 'shade' | 'flat' | 'drip' | 'hang'
export type WashingIron = 'low' | 'medium' | 'high' | 'no'

export type WashingReqs = {
    temperature: { min: number, max: number }
    drying: WashingDry
    iron: WashingIron
    special?: WashingSpecial
}

type WashingCoreState = {
    id: 'washing'
    index: number
    complete: boolean
    temperature: 0 | 1 | 2
    drying: 0 | 1 | 2
    iron: 0 | 1 | 2
    special: boolean
}

export type WashingLabels = {
    tempLabels: WashingTemp[]
    dryingLabels: WashingDry[]
    ironLabels: WashingIron[]
    specialLabel?: WashingSpecial
}

export type WashingItem =
    | 'jacket'
    | 'dress'
    | 'onesie'
    | 'lingerie'
    | 't-shirt'
    | 'towel'
    | 'bedsheets'
    | 'sheets'

export type WashingModule = {
    id: 'washing'
    blind: WashingCoreState & {
        specialLabel?: WashingSpecial
    }
    deaf: WashingCoreState & Omit<WashingLabels, 'specialLabel'> & {
        currentItem: WashingItem
    }
    mute: {
        id: 'washing'
        requirements: Record<WashingItem, WashingReqs>
    }
    state: WashingCoreState & WashingLabels & {
        position: number
        items: WashingItem[]
        currentItem: WashingItem
    }
}

export type Module =
    | WireModule
    | DirectionModule
    | SymbolModule
    | MatchModule
    | ChartModule
    | WashingModule

export type Rules = {
    chart: ChartModule['mute']
    direction: DirectionModule['mute']
    match: MatchModule['mute']
    symbol: SymbolModule['mute']
    wire: WireModule['mute']
    washing: WashingModule['mute']
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
    settings: GameSettings
    players: Pick<Player, 'id' | 'name' | 'type'>[]
    yourId: string
    password: string
    lobby: string
}

/* Game settings */

export type ModuleId = Module['id']

export type GameSettings = {
    freeRoleSwitching: boolean
    maxTime: number
    maxLives: number
    modules: ModuleId[]
}
