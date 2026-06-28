import type { Socket } from 'socket.io-client'

export type Player = {
    id: string
    socket: Socket
    name: string
    password: string
    money: number
    avatar: number
}

export type LobbyDetails = {
    numUsers: number
    stage: 'pending' | 'active' | 'complete'
}

export type ConnectOptions = {
    name?: string
    token?: string
}

export type PendingGameState = {
    state: 'pending'
    readyPlayers: string[]
}

export type CurrentAction =
    | {
        type: 'tag'
        users: string[]
    }
    | {
        type: 'guess'
        user: string
    }
    | {
        type: 'claim'
        users: string[]
        min: number
        max: number
    }

export type NormalColor =
    | 'red'
    | 'yellow'
    | 'green'
    | 'blue'
    | 'purple'

export type Racer =
    | NormalColor
    | 'black'
    | 'white'

export type PersonalCell = {
    ownerId: string
    direction: 1 | -1
}

export type Cell = {
    racers: Racer[]
    personalCell: PersonalCell | null
}

export type DiceType = DiceResult['type']

export type DiceResult =
    | {
        type: NormalColor
        result: number
    }
    | {
        type: 'crazy'
        actualRacer: 'black' | 'white'
        result: number
    }

export type OverallBet = {
    ownerId: string
    target: NormalColor
}

export type RoundBet = {
    target: NormalColor
    winPayoff: number
    assignedTo: string | null
}

export type GameState = {
    state: 'active'
    boardLength: number
    board: Cell[]
    rolledResults: DiceResult[]
    overallWinnerBets: OverallBet[]
    overallLoserBets: OverallBet[]
    roundBets: RoundBet[]
    currentTurn: string
    turnOrder: string[]
}

export type CompleteState = Omit<GameState, 'state'> & {
    state: 'complete'
}

export type VisibleOverallBet = {
    ownerId: string
    target?: NormalColor
}

export type VisibleOutput = {
    state: 'active' | 'complete'
    boardLength: number
    board: Cell[]
    rolledResults: DiceResult[]
    overallWinnerBets: VisibleOverallBet[]
    overallLoserBets: VisibleOverallBet[]
    roundBets: RoundBet[]
    currentTurn: string
    turnOrder: string[]
}

export type GameStateOutput = {
    players: Pick<Player, 'id' | 'name' | 'avatar' | 'money'>[]
    yourId: string
    password: string
    lobby: string
    hostPlayerId: string
    eventLog: GameEvent[]
    state: PendingGameState | VisibleOutput
}

export type GameSettings = {
    // Nothing here currently
}

export type GameEvent =
    | { type: 'roll', user: string, diceResult: DiceResult }
    | { type: 'overall-bet', user: string, betType: 'winner' | 'loser' }
    | { type: 'round-bet', user: string, bet: RoundBet }
    | { type: 'square', user: string, cell: number, face: 1 | -1 }
    | { type: 'end-of-round' }
