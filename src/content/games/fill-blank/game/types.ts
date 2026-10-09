import { Socket } from 'socket.io-client'

export type Player = {
    id: string
    socket: Socket
    name: string
    password: string
    status: 'disconnected' | 'waiting' | 'active'
    score: number
}

export type ConnectOptions = {
    name?: string
    token?: string
}

export type BasicPlayer = Pick<Player, 'id' | 'name' | 'status' | 'score'>

export type PendingGameState = {
    state: 'pending'
    readyPlayerIds: Set<string>
}

export type Target = 'middle' | 'bottom' | 'top' | 'divisive'

export type RoundPlayer = {
    submission?: string
    playerId: string
    id: number
    target: Target
}

export type Prompt = {
    promptText: string
    high: string
    low: string
}

export type SubmittingState = {
    state: 'submitting'
    prompt: Prompt
    players: RoundPlayer[]
}

export type ScoringRoundPlayer = Omit<RoundPlayer, 'submission'> & {
    submission: string
    assigned: number[]
    ranking?: number[]
}

export type ScoringState = {
    state: 'scoring'
    prompt: Prompt
    players: ScoringRoundPlayer[]
}

export type PostGameState = {
    state: 'post-game'
    prompt: Prompt
    players: ScoringRoundPlayer[]
}

export type GameState = PendingGameState | SubmittingState | ScoringState | PostGameState

export type GameStateKey = GameState['state']

export type PendingOutput = {
    state: 'pending'
    readyPlayerIds: string[]
}

export type SubmittingOutput = {
    state: 'submitting'
    prompt: Prompt
    readyPlayerIds: string[]
    target?: Target
}

export type ScoringOption = {
    id: number
    submission: string
}

export type ScoringOutput = {
    state: 'scoring'
    prompt: Prompt
    options: ScoringOption[]
    readyPlayerIds: string[]
}

export type PostGameOutput = PostGameState

export type StateOutput =
    | PendingOutput
    | SubmittingOutput
    | ScoringOutput
    | PostGameOutput

export type Output = {
    players: BasicPlayer[]
    state: StateOutput
    yourId: string
    password: string
    lobby: string
    hostPlayerId: string
}

export type LobbyDetails = {
    numUsers: number
    stage: GameStateKey
    roundNumber: number
}
