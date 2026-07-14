import type { PuzzleSchema } from './types'

type EdgeRuleShorthand =
    // No rule
    | null
    // Count rule
    | number
    // Nonogram rule
    | number[]

export const basicSchemaGenerator = (width: number, height: number, rows: EdgeRuleShorthand[] | null, cols: EdgeRuleShorthand[] | null): PuzzleSchema => {
    if (rows && rows.length !== height) {
        throw Error('Wrong number of row rules')
    }
    if (cols && cols.length !== width) {
        throw Error('Wrong number of column rules')
    }

    return {
        width,
        height,
        verticalEdgeRules: cols
            ? cols.map(rule => rule
                ? Array.isArray(rule)
                    ? { type: 'nonogram', groups: rule }
                    : { type: 'count', count: rule }
                : null)
            : undefined,
        horizontalEdgeRules: rows
            ? rows.map(rule => rule
                ? Array.isArray(rule)
                    ? { type: 'nonogram', groups: rule }
                    : { type: 'count', count: rule }
                : null)
            : undefined,
    }
}
