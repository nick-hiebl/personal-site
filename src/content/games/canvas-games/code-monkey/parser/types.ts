import type { FuncDeclStatement } from '.'

export type CoreFunction = {
    type: 'special'
    rejectsArgs?: (...args: any[]) => Error | null
    call: (...args: any[]) => Promise<BaseValue>
}

export type EvaluableFunction = {
    type: 'function'
    declaration: FuncDeclStatement
    closure: StackContext[]
}

export type BaseValue = number | boolean | number[] | boolean[]

export type Value = CoreFunction | EvaluableFunction | BaseValue

export type StackContext = {
    type: 'root' | 'global' | 'scope'
    variables: Map<string, Value>
} | {
    type: 'function'
    variables: Map<string, Value>
    isReturned: () => boolean
    returnFromFunc: (returnValue?: Value) => void
} | {
    type: 'loop'
    variables: Map<string, Value>
    isBroken: () => boolean
    breakLoop: () => void
}

export type ProgramContext = {
    contexts: StackContext[]
    running: () => boolean
    cancel: () => void
}

export type ExternalProgramState = {
    promise: Promise<void>
    cancel: () => void
}
