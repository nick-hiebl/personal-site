export type PuzzleSchema = {
    width: number
    height: number

    verticalEdgeRules?: EdgeRule[]
    horizontalEdgeRules?: EdgeRule[]

    cellRules?: { row: number, column: number, rule: CellRule }[]
}

export type EdgeRule =
    | null
    | { type: 'count', count: number }
    | { type: 'groups', count: number }
    | { type: 'inverted-groups', count: number }
    | { type: 'nonogram', groups: number[] }

export type CellRule =
    | { type: 'forced', state: boolean }

export type PuzzleState = {
    values: PuzzleStateValue[][]
}

export type PuzzleStateValue = null | true | false

// This type represents rules requiring explanation
export type RuleType =
    // No explanation needed for null edge rule
    | Exclude<EdgeRule, null>['type']
    // No explanation for cell rule, as the UX gives the user no choice
    | Exclude<CellRule['type'], 'forced'>
