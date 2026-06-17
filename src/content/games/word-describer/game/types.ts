import type { Socket } from 'socket.io-client'

export type Player = {
    id: string
    socket: Socket
    name: string
    password: string
    lastGuessedInRound: number
    status: 'disconnected' | 'waiting' | 'active'
}

export type ConnectOptions = {
    name?: string
    token?: string
}

export type BasicPlayer = {
    id: string
    name: string
    status: 'disconnected' | 'waiting' | 'active'
}

export type GameStateKey = 'pending' | 'giving-clues' | 'assessing-clues' | 'guessing' | 'post-game'

export type PendingGameState = {
    state: 'pending'
    readyPlayerIds: Set<string>
}

export type WordTag = 'illegal' | 'duplicate'

export type Clue = {
    sender: string
    word: string
    tags: WordTag[]
}

export type ClueingState = {
    state: 'giving-clues'
    secretWord: string
    guesserId: string
    clues: Clue[]
    readyPlayerIds: Set<string>
    startedAt: number
}

export type AssessingState = {
    state: 'assessing-clues'
    secretWord: string
    guesserId: string
    clues: Clue[]
    readyPlayerIds: Set<string>
}

export type GuessingState = {
    state: 'guessing'
    secretWord: string
    guesserId: string
    clues: Clue[]
}

export type PostGameState = {
    state: 'post-game'
    secretWord: string
    guess: string
    guesserId: string
    clues: Clue[]
    readyPlayerIds: Set<string>
}

export type GameState = PendingGameState | ClueingState | AssessingState | GuessingState | PostGameState

export type PendingOutput = {
    state: 'pending'
    readyPlayerIds: string[]
}

type MyClueOrOthers = Pick<Clue, 'sender'> | Pick<Clue, 'sender' | 'word'>

export type GivingCluesOutput = GivingCluesOutputGiver | GivingCluesOutputReceiver

export type GivingCluesOutputGiver = {
    state: 'giving-clues'
    guesserId: string
    readyPlayerIds: string[]
    secretWord: string
    clues: MyClueOrOthers[]
    cluesPerPlayer: number
    remainingDuration: number
}

export type GivingCluesOutputReceiver = {
    state: 'giving-clues'
    guesserId: string
    readyPlayerIds: string[]
    clues: Pick<Clue, 'sender'>[]
    cluesPerPlayer: number
    remainingDuration: number
}

type AssessingCluesOutputCommon = {
    state: 'assessing-clues'
    guesserId: string
    readyPlayerIds: string[]
}

export type AssessingCluesOutputGiver = AssessingCluesOutputCommon & {
    clues: Clue[]
    secretWord: string
}

export type AssessingCluesOutputReceiver = AssessingCluesOutputCommon & {
    clues: Pick<Clue, 'tags'>[]
}

export type AssessingCluesOutput = AssessingCluesOutputGiver | AssessingCluesOutputReceiver

export type GuessingOutput = {
    state: 'guessing'
    guesserId: string
} & ({ clues: Clue[]; secretWord: string } | { clues: Pick<Clue, 'word'>[] })

export type PostGameOutput = {
    state: 'post-game'
    guesserId: string
    secretWord: string
    guess: string
    clues: Clue[]
    readyPlayerIds: string[]
}

export type StateOutput =
    | PendingOutput
    | GivingCluesOutput
    | AssessingCluesOutput
    | GuessingOutput
    | PostGameOutput

export type Output = {
    players: BasicPlayer[]
    state: StateOutput
    yourId: string
    password: string
    lobby: string
    hostPlayerId: string
    seenWords: number
    avoidedPlayers: string[]
}

export type GameSettings = {
    cluesPerPlayer: number
    readiesRequired: Record<Exclude<GameStateKey, 'pending' | 'guessing'>, number>
    wordListWeights: Record<'default' | string, number>
    cluesTimerEnabled: boolean
    requiredClues: number
    cluesTimeout: number
}

export type LobbyDetails = {
    numUsers: number
    stage: GameStateKey
    roundNumber: number
}
