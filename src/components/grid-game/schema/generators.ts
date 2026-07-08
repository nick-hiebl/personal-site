import type { PuzzleSchema } from './types'

export const basicSchemaGenerator = (width: number, height: number, rows: (number | null)[] | null, cols: (number | null)[] | null): PuzzleSchema => {
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
            ? cols.map(rule => rule ? { type: 'count', count: rule } : null)
            : undefined,
        horizontalEdgeRules: rows
            ? rows.map(rule => rule ? { type: 'count', count: rule } : null)
            : undefined,
    }
}
