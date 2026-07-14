export type PuzzleSchema = {
    width: number
    height: number

    verticalEdgeRules?: EdgeRule[]
    horizontalEdgeRules?: EdgeRule[]
}

export type EdgeRule =
    | null
    | { type: 'count', count: number }
    | { type: 'groups', count: number }
    | { type: 'inverted-groups', count: number }
    | { type: 'nonogram', groups: number[] }

export type PuzzleState = {
    values: PuzzleStateValue[][]
}

export type PuzzleStateValue = null | true | false
